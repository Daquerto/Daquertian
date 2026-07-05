import type { Note } from '../../types/note';

type NoteTitleBarProps = {
  selectedNote: Note;
  notesCount: number;
  onTitleChange: (newTitle: string) => void;
  onDelete: () => void;
};

function NoteTitleBar({
  selectedNote,
  notesCount,
  onTitleChange,
  onDelete,
}: NoteTitleBarProps) {
  return (
    <>
      <input
        className="title-input"
        value={selectedNote.title}
        onChange={(event) => onTitleChange(event.target.value)}
      />

      <button
        className="delete-note-button"
        onClick={onDelete}
        disabled={notesCount === 1}
      >
        Удалить заметку
      </button>
    </>
  );
}

export default NoteTitleBar;
