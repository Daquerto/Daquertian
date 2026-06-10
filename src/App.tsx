import { useEffect, useState } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Handle, Position, ReactFlow } from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import './App.css';

type Note = {
  id: number;
  title: string;
  content: string;
};

type GraphEdge = {
  source: string;
  target: string;
};

type ActiveView = 'note' | 'graph';

const isNote = (value: unknown): value is Note => {
  return (
    typeof value === 'object' &&
    value !== null &&
    'id' in value &&
    'title' in value &&
    'content' in value
  );
};

const extractWikiLinks = (content: string): string[] => {
  const regex = /\[\[([^\]]+)\]\]/g;
  const matches = content.matchAll(regex);
  const links = Array.from(matches, (match) => match[1].trim());

  return [...new Set(links)];
};

const convertWikiLinksToMarkdown = (content: string): string => {
  return content.replace(/\[\[([^\]]+)\]\]/g, (_, linkText) => {
    const trimmedLinkText = linkText.trim();
    const encodedTitle = encodeURIComponent(trimmedLinkText);

    return `[${trimmedLinkText}](#note/${encodedTitle})`;
  });
};

const getBacklinks = (targetNote: Note, allNotes: Note[]): Note[] => {
  return allNotes.filter((note) => {
    if (note.id === targetNote.id) {
      return false;
    }

    const links = extractWikiLinks(note.content);

    return links.includes(targetNote.title);
  });
};

const buildGraphEdges = (notes: Note[]): GraphEdge[] => {
  return notes.flatMap((note) => {
    const links = extractWikiLinks(note.content);

    return links.map((link) => ({
      source: note.title,
      target: link,
    }));
  });
};

const buildReactFlowNodes = (notes: Note[], selectedNote: Note) => {
  return notes.map((note, index) => ({
    id: note.title,
    type: 'noteNode',
    position: {
      x: 120 + index * 180,
      y: 120 + (index % 2) * 140,
    },
    data: {
      label: note.title,
      active: note.id === selectedNote.id,
    },
  }));
};

const buildReactFlowEdges = (notes: Note[]) => {
  return buildGraphEdges(notes).map((edge) => ({
    id: `${edge.source}-${edge.target}`,
    source: edge.source,
    target: edge.target,
  }));
};

const NoteGraphNode = ({ data }: { data: { label: string; active: boolean } }) => {
  return (
    <div className="note-graph-node">
      <Handle type="target" position={Position.Top} />

      <div className={data.active ? 'note-graph-dot active' : 'note-graph-dot'} />

      <div className={data.active ? 'note-graph-label active' : 'note-graph-label'}>
        {data.label}
      </div>

      <Handle type="source" position={Position.Bottom} />
    </div>
  );
};

const nodeTypes = {
  noteNode: NoteGraphNode,
};

function App() {
  const [notes, setNotes] = useState<Note[]>(() => {
    const savedNotes = localStorage.getItem('daquertian-notes');

    if (savedNotes) {
      try {
        const parsedNotes = JSON.parse(savedNotes);

        if (Array.isArray(parsedNotes) && parsedNotes.every(isNote)) {
          return parsedNotes;
        }
      } catch {
        localStorage.removeItem('daquertian-notes');
      }
    }

    return [
      {
        id: 1,
        title: 'Первая заметка',
        content: 'Это текст первой заметки.',
      },
      {
        id: 2,
        title: 'Идеи проекта',
        content: 'Здесь будут идеи для Daquertian.',
      },
      {
        id: 3,
        title: 'Финансы',
        content: 'Заметка про личные финансы.',
      },
    ];
  });

  const [selectedNote, setSelectedNote] = useState<Note>(notes[0]);
  const [activeView, setActiveView] = useState<ActiveView>('note');
  const [openNoteIds, setOpenNoteIds] = useState<number[]>([notes[0].id]);

  useEffect(() => {
    localStorage.setItem('daquertian-notes', JSON.stringify(notes));
  }, [notes]);

  const openNote = (note: Note) => {
    setSelectedNote(note);
    setActiveView('note');

    if (!openNoteIds.includes(note.id)) {
      setOpenNoteIds([...openNoteIds, note.id]);
    }
  };

  const createNote = () => {
    const newNote = {
      id: Date.now(),
      title: `Новая заметка ${notes.length + 1}`,
      content: '',
    };

    setNotes([...notes, newNote]);
    setSelectedNote(newNote);
    setActiveView('note');
    setOpenNoteIds([...openNoteIds, newNote.id]);
  };

  const deleteSelectedNote = () => {
    if (notes.length === 1) {
      return;
    }

    const updatedNotes = notes.filter((note) => note.id !== selectedNote.id);
    const updatedOpenNoteIds = openNoteIds.filter((id) => id !== selectedNote.id);
    const safeOpenNoteIds = updatedOpenNoteIds.length > 0 ? updatedOpenNoteIds : [updatedNotes[0].id];

    setNotes(updatedNotes);
    setOpenNoteIds(safeOpenNoteIds);
    setSelectedNote(updatedNotes[0]);
    setActiveView('note');
  };

  const closeNoteTab = (noteId: number) => {
    if (openNoteIds.length === 1) {
      return;
    }

    const updatedOpenNoteIds = openNoteIds.filter((id) => id !== noteId);

    setOpenNoteIds(updatedOpenNoteIds);

    if (selectedNote.id === noteId) {
      const nextNoteId = updatedOpenNoteIds[updatedOpenNoteIds.length - 1];
      const nextNote = notes.find((note) => note.id === nextNoteId);

      if (nextNote) {
        setSelectedNote(nextNote);
        setActiveView('note');
      }
    }
  };

  const openOrCreateNoteByTitle = (noteTitle: string) => {
    const targetNote = notes.find((note) => note.title === noteTitle);

    if (targetNote) {
      openNote(targetNote);
      return;
    }

    const newNote = {
      id: Date.now(),
      title: noteTitle,
      content: '',
    };

    setNotes([...notes, newNote]);
    setSelectedNote(newNote);
    setActiveView('note');
    setOpenNoteIds([...openNoteIds, newNote.id]);
  };

  return (
    <div className="app">
      <aside className="sidebar">
        <h2>Daquertian</h2>

        <button className="create-note-button" onClick={createNote}>
          + Новая заметка
        </button>

        <div className="notes-list">
          {notes.map((note) => (
            <button
              className={note.id === selectedNote.id ? 'note-item active' : 'note-item'}
              key={note.id}
              onClick={() => openNote(note)}
            >
              {note.title}
            </button>
          ))}
        </div>
      </aside>

      <main className="workspace">
        <div className="workspace-tabs">
          {openNoteIds.map((noteId) => {
            const note = notes.find((item) => item.id === noteId);

            if (!note) {
              return null;
            }

            return (
              <button
                key={note.id}
                className={
                  activeView === 'note' && selectedNote.id === note.id
                    ? 'workspace-tab active'
                    : 'workspace-tab'
                }
                onClick={() => openNote(note)}
              >
                <span>{note.title}</span>

                <span
                  className="workspace-tab-close"
                  onClick={(event) => {
                    event.stopPropagation();
                    closeNoteTab(note.id);
                  }}
                >
                  ×
                </span>
              </button>
            );
          })}

          <button
            className={activeView === 'graph' ? 'workspace-tab active' : 'workspace-tab'}
            onClick={() => setActiveView('graph')}
          >
            Граф
          </button>
        </div>

        {activeView === 'note' && (
          <>
            <input
              className="title-input"
              value={selectedNote.title}
              onChange={(event) => {
                const newTitle = event.target.value;

                const updatedNotes = notes.map((note) =>
                  note.id === selectedNote.id ? { ...note, title: newTitle } : note
                );

                setNotes(updatedNotes);
                setSelectedNote({ ...selectedNote, title: newTitle });
              }}
            />

            <button
              className="delete-note-button"
              onClick={deleteSelectedNote}
              disabled={notes.length === 1}
            >
              Удалить заметку
            </button>

            <div className="editor-preview-layout">
              <textarea
                className="editor"
                value={selectedNote.content}
                onChange={(event) => {
                  const newContent = event.target.value;

                  const updatedNotes = notes.map((note) =>
                    note.id === selectedNote.id ? { ...note, content: newContent } : note
                  );

                  setNotes(updatedNotes);
                  setSelectedNote({ ...selectedNote, content: newContent });
                }}
              />

              <div className="preview">
                <ReactMarkdown
                  remarkPlugins={[remarkGfm]}
                  components={{
                    a: ({ href, children }) => {
                      if (href?.startsWith('#note/')) {
                        const noteTitle = decodeURIComponent(href.replace('#note/', ''));

                        return (
                          <button
                            className="wiki-link"
                            onClick={(event) => {
                              event.preventDefault();
                              openOrCreateNoteByTitle(noteTitle);
                            }}
                          >
                            {children}
                          </button>
                        );
                      }

                      return (
                        <a href={href} target="_blank" rel="noreferrer">
                          {children}
                        </a>
                      );
                    },
                  }}
                >
                  {convertWikiLinksToMarkdown(selectedNote.content)}
                </ReactMarkdown>
              </div>

              <div className="links-panel">
                <h3>Связи в заметке</h3>

                {extractWikiLinks(selectedNote.content).length === 0 ? (
                  <p>Связей пока нет.</p>
                ) : (
                  <ul>
                    {extractWikiLinks(selectedNote.content).map((link) => (
                      <li key={link}>{link}</li>
                    ))}
                  </ul>
                )}
              </div>

              <div className="backlinks-panel">
                <h3>Ссылаются на эту заметку</h3>

                {getBacklinks(selectedNote, notes).length === 0 ? (
                  <p>Обратных ссылок пока нет.</p>
                ) : (
                  <ul>
                    {getBacklinks(selectedNote, notes).map((note) => (
                      <li key={note.id}>
                        <button className="backlink-button" onClick={() => openNote(note)}>
                          {note.title}
                        </button>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>
          </>
        )}

        {activeView === 'graph' && (
          <div className="graph-section graph-section-full">
            <h3>Граф связей</h3>

            <div className="graph-view graph-view-full">
              <ReactFlow
                nodes={buildReactFlowNodes(notes, selectedNote)}
                edges={buildReactFlowEdges(notes)}
                nodeTypes={nodeTypes}
                proOptions={{ hideAttribution: true }}
                fitView
                onNodeClick={(_, node) => {
                  const targetNote = notes.find((note) => note.title === node.id);

                  if (targetNote) {
                    openNote(targetNote);
                  }
                }}
              />
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

export default App;
