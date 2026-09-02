import { renameBookmarkFolderAction, setBookmarkFolderAction } from "@/app/account/bookmarks/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

type Props = {
  bookmarkId: string;
  folderName: string | null;
  /** Folders this user already has, offered as suggestions. */
  folders: string[];
};

/**
 * Move one bookmark into a folder.
 *
 * A native datalist rather than a combobox component: the browser already
 * does "pick an existing one or type a new one", which is the entire
 * requirement. Clearing the field files the bookmark under Unfiled.
 */
export function FolderForm({ bookmarkId, folderName, folders }: Props) {
  const listId = `folders-${bookmarkId}`;

  return (
    <form action={setBookmarkFolderAction} className="flex items-center gap-2">
      <input type="hidden" name="bookmark_id" value={bookmarkId} />
      <label className="sr-only" htmlFor={`folder-${bookmarkId}`}>
        Folder
      </label>
      <Input
        id={`folder-${bookmarkId}`}
        name="folder_name"
        list={listId}
        defaultValue={folderName ?? ""}
        /*
         * "Unfiled" as placeholder text read as a value that was already set,
         * so the box looked like a label rather than something to type into —
         * the first person to use this could not find how to make a folder.
         * The placeholder now says what to do with it.
         */
        placeholder="Add to folder…"
        maxLength={60}
        className="h-8 max-w-48"
      />
      <datalist id={listId}>
        {folders.map((folder) => (
          <option key={folder} value={folder} />
        ))}
      </datalist>
      <Button type="submit" variant="ghost" size="sm">
        Move
      </Button>
    </form>
  );
}

/**
 * Rename one folder across every bookmark in it.
 *
 * Folders are free text on the bookmark row — no folders table at MVP — so a
 * rename is an update across its members, and emptying the field tips them
 * all back into Unfiled.
 */
export function RenameFolderForm({ folder }: { folder: string }) {
  return (
    <form action={renameBookmarkFolderAction} className="flex items-center gap-2">
      <input type="hidden" name="from" value={folder} />
      <label className="sr-only" htmlFor={`rename-${folder}`}>
        Rename folder {folder}
      </label>
      <Input
        id={`rename-${folder}`}
        name="to"
        defaultValue={folder}
        maxLength={60}
        className="h-8 max-w-48"
      />
      <Button type="submit" variant="ghost" size="sm">
        Rename
      </Button>
    </form>
  );
}
