import { useState } from 'react';
import type { Note } from '../../types/note';

type SidebarProps = {
  notes: Note[];
  selectedNote: Note;
  vaultPath: string | null;
  openNote: (note: Note) => void;
  createNote: () => void;
  openVault: () => void;
};

function Sidebar({
  notes,
  selectedNote,
  vaultPath,
  openNote,
  createNote,
  openVault,
}: SidebarProps) {
  const [searchQuery, setSearchQuery] = useState('');

  const normalizedSearchQuery = searchQuery.trim().toLowerCase();

  const filteredNotes = notes.filter((note) => {
    if (normalizedSearchQuery.length === 0) {
      return true;
    }

    return (
      note.title.toLowerCase().includes(normalizedSearchQuery) ||
      note.content.toLowerCase().includes(normalizedSearchQuery)
    );
  });

  return (
    <aside className="sidebar">
      <h2>Daquertian</h2>

      <button className="create-note-button" onClick={createNote}>
        + Новая заметка
      </button>

      <button className="open-vault-button" onClick={openVault}>
        📂 Open Vault
      </button>

      {vaultPath && (
        <div className="vault-path" title={vaultPath}>
          {vaultPath}
        </div>
      )}

      <input
        className="sidebar-search"
        placeholder="Поиск заметок..."
        value={searchQuery}
        onChange={(event) => setSearchQuery(event.target.value)}
      />

      <div className="notes-list">
        {filteredNotes.length === 0 ? (
          <p className="empty-search-message">Ничего не найдено.</p>
        ) : (
          filteredNotes.map((note) => (
            <button
              key={note.id}
              className={
                note.id === selectedNote.id
                  ? 'note-item active'
                  : 'note-item'
              }
              onClick={() => openNote(note)}
            >
              {note.title}
            </button>
          ))
        )}
      </div>
    </aside>
  );
}

export default Sidebar;