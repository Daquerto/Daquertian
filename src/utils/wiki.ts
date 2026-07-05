import type { Note } from '../types/note';

export const isNote = (value: unknown): value is Note => {
  return (
    typeof value === 'object' &&
    value !== null &&
    'id' in value &&
    'title' in value &&
    'content' in value
  );
};

export const extractWikiLinks = (content: string): string[] => {
  const regex = /\[\[([^\]]+)\]\]/g;
  const matches = content.matchAll(regex);
  const links = Array.from(matches, (match) => match[1].trim());

  return [...new Set(links)];
};

export const convertWikiLinksToMarkdown = (content: string): string => {
  return content.replace(/\[\[([^\]]+)\]\]/g, (_, linkText) => {
    const trimmedLinkText = linkText.trim();
    const encodedTitle = encodeURIComponent(trimmedLinkText);

    return `[${trimmedLinkText}](#note/${encodedTitle})`;
  });
};