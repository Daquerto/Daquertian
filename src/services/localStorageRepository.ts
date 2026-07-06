import type { Note } from "../types/note";
import type { NotesRepository } from "./notesRepository";

const STORAGE_KEY = "daquertian-notes";

export class LocalStorageRepository implements NotesRepository {
    async loadNotes(): Promise<Note[]> {
        const json = localStorage.getItem(STORAGE_KEY);

        if (!json)
            return [];

        return JSON.parse(json);
    }

    async saveNote(note: Note): Promise<void> {
        const json = localStorage.getItem(STORAGE_KEY);

        const notes: Note[] = json ? JSON.parse(json) : [];

        const index = notes.findIndex(n => n.id === note.id);

        if (index >= 0)
            notes[index] = note;
        else
            notes.push(note);

        localStorage.setItem(STORAGE_KEY, JSON.stringify(notes));
    }

    async deleteNote(noteId: number): Promise<void> {
        const json = localStorage.getItem(STORAGE_KEY);

        const notes: Note[] = json ? JSON.parse(json) : [];

        localStorage.setItem(
            STORAGE_KEY,
            JSON.stringify(notes.filter(n => n.id !== noteId))
        );
    }
}