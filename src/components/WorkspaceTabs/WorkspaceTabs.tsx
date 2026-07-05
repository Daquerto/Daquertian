import type { Note } from "../../types/note";

type ActiveView = "note" | "graph";

type WorkspaceTabsProps = {
  notes: Note[];
  selectedNote: Note;
  activeView: ActiveView;
  openNoteIds: number[];
  openNote: (note: Note) => void;
  closeNoteTab: (noteId: number) => void;
  setActiveView: (view: ActiveView) => void;
};

function WorkspaceTabs({
  notes,
  selectedNote,
  activeView,
  openNoteIds,
  openNote,
  closeNoteTab,
  setActiveView,
}: WorkspaceTabsProps) {
  return (
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
              activeView === "note" && selectedNote.id === note.id
                ? "workspace-tab active"
                : "workspace-tab"
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
        className={activeView === "graph" ? "workspace-tab active" : "workspace-tab"}
        onClick={() => setActiveView("graph")}
      >
        Граф
      </button>
    </div>
  );
}

export default WorkspaceTabs;