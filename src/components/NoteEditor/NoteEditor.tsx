import type { Note } from '../../types/note';

type NoteEditorProps = {
  selectedNote: Note;
  onContentChange: (newContent: string) => void;
};

function NoteEditor({ selectedNote, onContentChange }: NoteEditorProps) {
  return (
    <textarea
      className="editor"
      value={selectedNote.content}
      onChange={(event) => onContentChange(event.target.value)}
    />
  );
}

export default NoteEditor;
