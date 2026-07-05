import type { Note } from '../../types/note';

type BacklinksPanelProps = {
  backlinks: Note[];
  openNote: (note: Note) => void;
};

function BacklinksPanel({ backlinks, openNote }: BacklinksPanelProps) {
  return (
    <div className="backlinks-panel">
      <h3>Ссылаются на эту заметку</h3>

      {backlinks.length === 0 ? (
        <p>Обратных ссылок пока нет.</p>
      ) : (
        <ul>
          {backlinks.map((note) => (
            <li key={note.id}>
              <button
                className="backlink-button"
                onClick={() => openNote(note)}
              >
                {note.title}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default BacklinksPanel;
