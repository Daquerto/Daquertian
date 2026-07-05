import Sidebar from './components/Sidebar/Sidebar';
import WorkspaceTabs from './components/WorkspaceTabs/WorkspaceTabs';
import NoteTitleBar from './components/NoteTitleBar/NoteTitleBar';
import NoteEditor from './components/NoteEditor/NoteEditor';
import MarkdownPreview from './components/MarkdownPreview/MarkdownPreview';
import LinksPanel from './components/LinksPanel/LinksPanel';
import BacklinksPanel from './components/BacklinksPanel/BacklinksPanel';
import GraphView from './components/GraphView/GraphView';
import { useNotes } from './hooks/useNotes';
import { extractWikiLinks } from './utils/wiki';
import './App.css';

function App() {
  const {
    notes,
    selectedNote,
    activeView,
    openNoteIds,

    setActiveView,

    openNote,
    createNote,
    deleteSelectedNote,
    closeNoteTab,
    openOrCreateNoteByTitle,
    updateSelectedNoteTitle,
    updateSelectedNoteContent,
  } = useNotes();

  return (
    <div className="app">
      <Sidebar
        notes={notes}
        selectedNote={selectedNote}
        openNote={openNote}
        createNote={createNote}
      />

      <main className="workspace">
        <WorkspaceTabs
          notes={notes}
          selectedNote={selectedNote}
          activeView={activeView}
          openNoteIds={openNoteIds}
          openNote={openNote}
          closeNoteTab={closeNoteTab}
          setActiveView={setActiveView}
        />

        {activeView === 'note' && (
          <>
            <NoteTitleBar
              selectedNote={selectedNote}
              notesCount={notes.length}
              onTitleChange={updateSelectedNoteTitle}
              onDelete={deleteSelectedNote}
            />

            <div className="editor-preview-layout">
              <NoteEditor
                selectedNote={selectedNote}
                onContentChange={updateSelectedNoteContent}
              />

              <MarkdownPreview
                content={selectedNote.content}
                openOrCreateNoteByTitle={openOrCreateNoteByTitle}
              />

              <LinksPanel links={extractWikiLinks(selectedNote.content)} />

              <BacklinksPanel
                backlinks={notes.filter((note) => {
                  if (note.id === selectedNote.id) {
                    return false;
                  }

                  return extractWikiLinks(note.content).includes(selectedNote.title);
                })}
                openNote={openNote}
              />
            </div>
          </>
        )}

        {activeView === 'graph' && (
          <GraphView
            notes={notes}
            selectedNote={selectedNote}
            openNote={openNote}
          />
        )}
      </main>
    </div>
  );
}

export default App;