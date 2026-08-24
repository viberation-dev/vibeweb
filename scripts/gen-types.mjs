/**
 * Generates types/supabase.ts by introspecting the live database.
 *
 * Stopgap for `supabase gen types typescript`, which shells out to Docker.
 * Once Docker (or a Supabase access token) is available on the build machine,
 * switch this script out for the official CLI and delete it — the output
 * format is deliberately the same shape.
 *
 * Usage:  SUPABASE_DB_URL="postgresql://..." npm run gen:types
 * The connection string is never stored in the repo. Grab it from the
 * Supabase dashboard: Project Settings -> Database -> Connection string.
 */
import { writeFileSync } from 'node:fs';
import pg from 'pg';

const { Client } = pg;

const SCALAR = {
  uuid:'string', text:'string', varchar:'string', bpchar:'string', name:'string',
  timestamptz:'string', timestamp:'string', date:'string', time:'string', timetz:'string',
  bool:'boolean',
  int2:'number', int4:'number', int8:'number', float4:'number', float8:'number', numeric:'number',
  json:'Json', jsonb:'Json',
};

(async () => {
  const connectionString = process.env.SUPABASE_DB_URL;
  if (!connectionString) {
    console.error('Missing SUPABASE_DB_URL. See the header of this file.');
    process.exit(1);
  }
  const out = process.argv[2] || 'types/supabase.ts';
  const c = new Client({ connectionString, ssl: { rejectUnauthorized: false }, connectionTimeoutMillis: 20000 });
  await c.connect();

  // enums
  const en = await c.query(`select t.typname, e.enumlabel from pg_type t
    join pg_enum e on e.enumtypid=t.oid join pg_namespace n on n.oid=t.typnamespace
    where n.nspname='public' order by t.typname, e.enumsortorder`);
  const enums = {};
  for (const r of en.rows) (enums[r.typname] ||= []).push(r.enumlabel);

  // columns
  const cols = await c.query(`select c.relname tbl, a.attname col, a.attnum,
      format_type(a.atttypid,a.atttypmod) ftype, t.typname, t.typcategory,
      not a.attnotnull nullable, (d.adbin is not null) has_default,
      a.attidentity, a.attgenerated
    from pg_class c
    join pg_namespace n on n.oid=c.relnamespace
    join pg_attribute a on a.attrelid=c.oid and a.attnum>0 and not a.attisdropped
    join pg_type t on t.oid=a.atttypid
    left join pg_attrdef d on d.adrelid=c.oid and d.adnum=a.attnum
    where n.nspname='public' and c.relkind='r' order by c.relname, a.attnum`);

  // foreign keys
  const fks = await c.query(`select con.conname, c.relname tbl, rc.relname reftbl,
      (select array_agg(att.attname::text order by k.ord)
        from unnest(con.conkey) with ordinality k(attnum,ord)
        join pg_attribute att on att.attrelid=c.oid and att.attnum=k.attnum) cols,
      (select array_agg(att.attname::text order by k.ord)
        from unnest(con.confkey) with ordinality k(attnum,ord)
        join pg_attribute att on att.attrelid=rc.oid and att.attnum=k.attnum) refcols,
      exists(select 1 from pg_index i where i.indrelid=c.oid and i.indisunique
             and i.indkey::int2[] @> con.conkey and con.conkey @> i.indkey::int2[]) is_one_to_one
    from pg_constraint con
    join pg_class c on c.oid=con.conrelid
    join pg_class rc on rc.oid=con.confrelid
    join pg_namespace n on n.oid=c.relnamespace
    where con.contype='f' and n.nspname='public' order by c.relname, con.conname`);

  function tsType(r) {
    if (r.typcategory === 'A') {                       // array
      const base = r.typname.replace(/^_/,'');
      return (enums[base] ? `Database["public"]["Enums"]["${base}"]` : (SCALAR[base] || 'unknown')) + '[]';
    }
    if (enums[r.typname]) return `Database["public"]["Enums"]["${r.typname}"]`;
    return SCALAR[r.typname] || 'unknown';
  }

  const byTable = {};
  for (const r of cols.rows) (byTable[r.tbl] ||= []).push(r);

  const L = [];
  L.push('// Generated from the live Viberation schema (migrations 01-06).');
  L.push('// Regenerate with: npm run gen:types');
  L.push('');
  L.push('export type Json =');
  L.push('  | string');
  L.push('  | number');
  L.push('  | boolean');
  L.push('  | null');
  L.push('  | { [key: string]: Json | undefined }');
  L.push('  | Json[];');
  L.push('');
  L.push('export type Database = {');
  L.push('  public: {');
  L.push('    Tables: {');

  for (const tbl of Object.keys(byTable).sort()) {
    const rows = byTable[tbl];
    L.push(`      ${tbl}: {`);
    L.push('        Row: {');
    for (const r of rows) L.push(`          ${r.col}: ${tsType(r)}${r.nullable ? ' | null' : ''};`);
    L.push('        };');
    L.push('        Insert: {');
    for (const r of rows) {
      const optional = r.nullable || r.has_default || r.attidentity !== '' || r.attgenerated !== '';
      L.push(`          ${r.col}${optional ? '?' : ''}: ${tsType(r)}${r.nullable ? ' | null' : ''};`);
    }
    L.push('        };');
    L.push('        Update: {');
    for (const r of rows) L.push(`          ${r.col}?: ${tsType(r)}${r.nullable ? ' | null' : ''};`);
    L.push('        };');
    const rel = fks.rows.filter(f => f.tbl === tbl);
    if (!rel.length) L.push('        Relationships: [];');
    else {
      L.push('        Relationships: [');
      for (const f of rel) {
        L.push('          {');
        L.push(`            foreignKeyName: "${f.conname}";`);
        L.push(`            columns: [${f.cols.map(x=>`"${x}"`).join(', ')}];`);
        L.push(`            isOneToOne: ${f.is_one_to_one};`);
        L.push(`            referencedRelation: "${f.reftbl}";`);
        L.push(`            referencedColumns: [${f.refcols.map(x=>`"${x}"`).join(', ')}];`);
        L.push('          },');
      }
      L.push('        ];');
    }
    L.push('      };');
  }

  L.push('    };');
  L.push('    Views: { [_ in never]: never };');
  L.push('    Functions: { [_ in never]: never };');
  L.push('    Enums: {');
  for (const k of Object.keys(enums).sort()) {
    L.push(`      ${k}: ${enums[k].map(v=>`"${v}"`).join(' | ')};`);
  }
  L.push('    };');
  L.push('    CompositeTypes: { [_ in never]: never };');
  L.push('  };');
  L.push('};');
  L.push('');
  L.push('type PublicSchema = Database["public"];');
  L.push('');
  L.push('export type Tables<T extends keyof PublicSchema["Tables"]> = PublicSchema["Tables"][T]["Row"];');
  L.push('export type TablesInsert<T extends keyof PublicSchema["Tables"]> = PublicSchema["Tables"][T]["Insert"];');
  L.push('export type TablesUpdate<T extends keyof PublicSchema["Tables"]> = PublicSchema["Tables"][T]["Update"];');
  L.push('export type Enums<T extends keyof PublicSchema["Enums"]> = PublicSchema["Enums"][T];');
  L.push('');

  writeFileSync(out, L.join('\n'));
  await c.end();
  console.log(`wrote ${out}: ${Object.keys(byTable).length} tables, ${Object.keys(enums).length} enums, ${fks.rows.length} FKs`);
})().catch(e=>{console.error('FATAL',e.message);process.exit(1)});
