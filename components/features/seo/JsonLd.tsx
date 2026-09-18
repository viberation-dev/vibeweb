/**
 * Renders schema.org JSON-LD (VIB-183). `<` is escaped so authored text
 * containing `</script>` cannot close the tag early.
 */
export function JsonLd({ data }: { data: object }) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify(data).replace(/</g, "\\u003c"),
      }}
    />
  );
}
