import { invoke } from '@tauri-apps/api/core';
import { openDirectoryDialog } from '../tauri/dialog';
import type { Note } from '../types/note';

type OpenVaultResult = {
  path: string;
  notes: Note[];
};

export const openVault = async (): Promise<OpenVaultResult | null> => {
  const selectedPath = await openDirectoryDialog();

  if (!selectedPath) {
    return null;
  }

  const notes = await invoke<Note[]>('scan_vault', {
    vaultPath: selectedPath,
  });

  return {
    path: selectedPath,
    notes,
  };
};

export const saveNoteToVault = async (note: Note): Promise<void> => {
  if (!note.path) {
    throw new Error('У заметки нет пути к файлу');
  }

  await invoke('save_note', {
    path: note.path,
    content: note.content,
  });
};