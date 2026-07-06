import type { Note } from '../types/note';
import { extractWikiLinks } from './wiki';

export type KnowledgeGraphNode = {
  id: string;
  title: string;
  path?: string;
  exists: boolean;
  active: boolean;
  linksCount: number;
};

export type KnowledgeGraphLink = {
  source: string;
  target: string;
};

export type KnowledgeGraphData = {
  nodes: KnowledgeGraphNode[];
  links: KnowledgeGraphLink[];
};

export const buildKnowledgeGraph = (
  notes: Note[],
  selectedNote: Note
): KnowledgeGraphData => {
  const nodesMap = new Map<string, KnowledgeGraphNode>();
  const links: KnowledgeGraphLink[] = [];

  notes.forEach((note) => {
    nodesMap.set(note.title, {
      id: note.title,
      title: note.title,
      path: note.path,
      exists: true,
      active: note.title === selectedNote.title,
      linksCount: 0,
    });
  });

  notes.forEach((note) => {
    const linksFromNote = extractWikiLinks(note.content);

    linksFromNote.forEach((targetTitle) => {
      links.push({
        source: note.title,
        target: targetTitle,
      });

      const sourceNode = nodesMap.get(note.title);

      if (sourceNode) {
        sourceNode.linksCount += 1;
      }

      if (!nodesMap.has(targetTitle)) {
        nodesMap.set(targetTitle, {
          id: targetTitle,
          title: targetTitle,
          exists: false,
          active: false,
          linksCount: 0,
        });
      }
    });
  });

  return {
    nodes: Array.from(nodesMap.values()),
    links,
  };
};