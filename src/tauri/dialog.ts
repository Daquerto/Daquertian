import { open } from '@tauri-apps/plugin-dialog';

export const openDirectoryDialog = async (): Promise<string | null> => {
  const selectedPath = await open({
    directory: true,
    multiple: false,
  });

  if (typeof selectedPath !== 'string') {
    return null;
  }

  return selectedPath;
};