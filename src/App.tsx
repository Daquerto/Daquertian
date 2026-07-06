import { useState } from 'react';
import Sidebar from './components/Sidebar/Sidebar';
import WorkspaceTabs from './components/WorkspaceTabs/WorkspaceTabs';
import NoteTitleBar from './components/NoteTitleBar/NoteTitleBar';
import NoteEditor from './components/NoteEditor/NoteEditor';
import MarkdownPreview from './components/MarkdownPreview/MarkdownPreview';
import LinksPanel from './components/LinksPanel/LinksPanel';
import BacklinksPanel from './components/BacklinksPanel/BacklinksPanel';
import GraphView from './components/GraphView/GraphView';
import { useNotes } from './hooks/useNotes';
import { openVault } from './services/vaultService';
import { extractWikiLinks } from './utils/wiki';
import './App.css';

function App() {
  const [vaultPath, setVaultPath] = useState<string | null>(null);

  const {
    notes,
    selectedNote,
    activeView,
    openNoteIds,

    setActiveView,
    replaceNotes,
    openNote,
    createNote,
    deleteSelectedNote,
    closeNoteTab,
    openOrCreateNoteByTitle,
    updateSelectedNoteTitle,
    updateSelectedNoteContent,
  } = useNotes();

    const handleOpenVault = async () => {
    const openedVault = await openVault();

    if (!openedVault) {
      return;
    }

    setVaultPath(openedVault.path);
    replaceNotes(openedVault.notes);
  };

  return (
    <div className="app">
      <Sidebar
        notes={notes}
        selectedNote={selectedNote}
        vaultPath={vaultPath}
        openNote={openNote}
        createNote={createNote}
        openVault={handleOpenVault}
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