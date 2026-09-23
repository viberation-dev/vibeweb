/**
 * Turning comment rows into the two-level thread the page renders (VIB-199).
 *
 * Split out of lib/queries/comments.ts so the shaping is testable without a
 * database: the interesting behaviour here is what happens to a reply whose
 * parent is not in the list, and that is exactly the case a live query is
 * awkward to reproduce.
 *
 * Alias-free and dependency-free: comment-tree.test.ts runs under
 * `node --experimental-strip-types`.
 */

/** The row shape the thread query returns, narrowed to what shaping needs. */
export type CommentRow = {
  id: string;
  body: string;
  created_at: string;
  parent_id: string | null;
  user_id: string;
  author: { username: string | null; avatar_path: string | null } | null;
  comment_appreciations: { user_id: string }[] | null;
};

export type CommentNode = {
  id: string;
  body: string;
  createdAt: string;
  author: {
    id: string;
    name: string;
    initials: string;
    avatarPath: string | null;
  };
  appreciations: number;
  /** Whether the current reader appreciated it. False when signed out. */
  mine: boolean;
  /** Whether the current reader wrote it, and can therefore delete it. */
  isAuthor: boolean;
  replies: CommentNode[];
};

/**
 * Display name for a commenter.
 *
 * `profiles.username` is nullable — an OAuth account has one only once the
 * person sets it — and a thread of blanks is worse than a thread of
 * "Member". Never the email: this is a public page.
 */
export function displayName(username: string | null | undefined): string {
  return username?.trim() || "Member";
}

/** Up to two letters for the avatar. */
export function initialsFor(name: string): string {
  const parts = name.split(/\s+/).filter(Boolean);
  const letters =
    parts.length > 1 ? `${parts[0][0]}${parts[1][0]}` : name.slice(0, 2);
  return letters.toUpperCase();
}

function toNode(row: CommentRow, userId?: string | null): CommentNode {
  const name = displayName(row.author?.username);
  const likes = row.comment_appreciations ?? [];

  return {
    id: row.id,
    body: row.body,
    createdAt: row.created_at,
    author: {
      id: row.user_id,
      name,
      initials: initialsFor(name),
      avatarPath: row.author?.avatar_path ?? null,
    },
    appreciations: likes.length,
    mine: userId ? likes.some((like) => like.user_id === userId) : false,
    isAuthor: Boolean(userId) && row.user_id === userId,
    replies: [],
  };
}

/**
 * Rows (oldest first) into roots with their replies.
 *
 * Two passes rather than a recursive walk: the schema allows exactly one
 * level of replies and the `comments_depth` trigger enforces it, so a tree
 * builder would be machinery for a shape that cannot occur.
 *
 * A reply whose parent is missing — hidden by a moderator, so filtered out
 * by RLS before it ever reached us — is promoted to the top level rather
 * than dropped. The reply is not the comment that was moderated, and
 * silently swallowing it would hide someone else's words as collateral.
 */
export function buildCommentTree(
  rows: CommentRow[],
  userId?: string | null,
): CommentNode[] {
  const byId = new Map<string, CommentNode>();
  const roots: CommentNode[] = [];

  for (const row of rows) {
    if (row.parent_id) continue;
    const node = toNode(row, userId);
    byId.set(node.id, node);
    roots.push(node);
  }

  for (const row of rows) {
    if (!row.parent_id) continue;
    const node = toNode(row, userId);
    const parent = byId.get(row.parent_id);
    if (parent) parent.replies.push(node);
    else roots.push(node);
  }

  return roots;
}

/** Comments plus replies — what the header and the dock count. */
export function countCommentNodes(nodes: CommentNode[]): number {
  return nodes.reduce((total, node) => total + 1 + node.replies.length, 0);
}
