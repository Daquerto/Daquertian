import type { Note } from "../types/note";

export interface NotesRepository {
    loadNotes(): Promise<Note[]>;
    saveNote(note: Note): Promise<void>;
    deleteNote(noteId: number): Promise<void>;
}