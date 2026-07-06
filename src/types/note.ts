export type Note = {
  id: number;
  title: string;
  content: string;
  path?: string;
  lastModified?: number;
  isDirty?: boolean;
};

export const getNoteKey = (note: Note): string => {
  return note.path ?? `local:${note.id}`;
};