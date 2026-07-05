import { useEffect, useState } from 'react';
import type { Note } from '../types/note';
import { isNote } from '../utils/wiki';

export type ActiveView = 'note' | 'graph';

const defaultNotes: Note[] = [
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

const loadNotes = (): Note[] => {
  const savedNotes = localStorage.getItem('daquertian-notes');

  if (savedNotes) {
    try {
      const parsedNotes = JSON.parse(savedNotes);

      if (
        Array.isArray(parsedNotes) &&
        parsedNotes.length > 0 &&
        parsedNotes.every(isNote)
      ) {
        return parsedNotes;
      }
    } catch {
      localStorage.removeItem('daquertian-notes');
    }
  }

  return defaultNotes;
};

export function useNotes() {
  const [notes, setNotes] = useState<Note[]>(loadNotes);
  const [selectedNote, setSelectedNote] = useState<Note>(() => notes[0]);
  const [activeView, setActiveView] = useState<ActiveView>('note');
  const [openNoteIds, setOpenNoteIds] = useState<number[]>(() => [notes[0].id]);

  useEffect(() => {
    localStorage.setItem('daquertian-notes', JSON.stringify(notes));
  }, [notes]);

  const openNote = (note: Note) => {
    setSelectedNote(note);
    setActiveView('note');

    setOpenNoteIds((currentIds) =>
      currentIds.includes(note.id) ? currentIds : [...currentIds, note.id]
    );
  };

  const createNote = () => {
    const newNote: Note = {
      id: Date.now(),
      title: `Новая заметка ${notes.length + 1}`,
      content: '',
    };

    setNotes((currentNotes) => [...currentNotes, newNote]);
    setSelectedNote(newNote);
    setActiveView('note');
    setOpenNoteIds((currentIds) => [...currentIds, newNote.id]);
  };

  const deleteSelectedNote = () => {
    if (notes.length === 1) {
      return;
    }

    const updatedNotes = notes.filter((note) => note.id !== selectedNote.id);
    const updatedOpenNoteIds = openNoteIds.filter((id) => id !== selectedNote.id);
    const safeOpenNoteIds =
      updatedOpenNoteIds.length > 0 ? updatedOpenNoteIds : [updatedNotes[0].id];

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

    const newNote: Note = {
      id: Date.now(),
      title: noteTitle,
      content: '',
    };

    setNotes((currentNotes) => [...currentNotes, newNote]);
    setSelectedNote(newNote);
    setActiveView('note');
    setOpenNoteIds((currentIds) => [...currentIds, newNote.id]);
  };

  const updateSelectedNoteTitle = (newTitle: string) => {
    const updatedNotes = notes.map((note) =>
      note.id === selectedNote.id ? { ...note, title: newTitle } : note
    );

    setNotes(updatedNotes);
    setSelectedNote({ ...selectedNote, title: newTitle });
  };

  const updateSelectedNoteContent = (newContent: string) => {
    const updatedNotes = notes.map((note) =>
      note.id === selectedNote.id ? { ...note, content: newContent } : note
    );

    setNotes(updatedNotes);
    setSelectedNote({ ...selectedNote, content: newContent });
  };

  return {
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
  };
}