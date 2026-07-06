import { useEffect, useMemo, useRef, useState } from 'react';
import ForceGraph2D, { type ForceGraphMethods } from 'react-force-graph-2d';
import type { Note } from '../../types/note';
import {
  buildKnowledgeGraph,
  type KnowledgeGraphLink,
  type KnowledgeGraphNode,
} from '../../utils/graph';

type GraphViewProps = {
  notes: Note[];
  selectedNote: Note;
  openNote: (note: Note) => void;
};

const getNodeId = (node: string | KnowledgeGraphNode) => {
  return typeof node === 'string' ? node : node.id;
};

function GraphView({ notes, selectedNote, openNote }: GraphViewProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const graphRef = useRef<
    ForceGraphMethods<KnowledgeGraphNode, KnowledgeGraphLink> | undefined
  >(undefined);

  const [graphSize, setGraphSize] = useState({
    width: 900,
    height: 600,
  });

  const graphData = useMemo(
    () => buildKnowledgeGraph(notes, selectedNote),
    [notes, selectedNote]
  );

  const activeNodeIds = useMemo(() => {
    const ids = new Set<string>();
    ids.add(selectedNote.title);

    graphData.links.forEach((link) => {
      const sourceId = getNodeId(link.source);
      const targetId = getNodeId(link.target);

      if (sourceId === selectedNote.title) {
        ids.add(targetId);
      }

      if (targetId === selectedNote.title) {
        ids.add(sourceId);
      }
    });

    return ids;
  }, [graphData.links, selectedNote.title]);

  useEffect(() => {
    const container = containerRef.current;

    if (!container) {
      return;
    }

    const resizeObserver = new ResizeObserver(([entry]) => {
      const { width, height } = entry.contentRect;

      setGraphSize({
        width: Math.max(width, 300),
        height: Math.max(height, 300),
      });

      window.setTimeout(() => {
        graphRef.current?.zoomToFit(500, 80);
      }, 100);
    });

    resizeObserver.observe(container);

    return () => resizeObserver.disconnect();
  }, []);

  useEffect(() => {
    const graph = graphRef.current;

    if (!graph) {
      return;
    }

    graph.d3Force('charge')?.strength(-420);
    graph.d3Force('link')?.distance(190);

    window.setTimeout(() => {
      graph.zoomToFit(900, 90);
    }, 800);
  }, [graphData]);

  return (
    <div className="graph-section graph-section-full">
      <h3>Граф связей</h3>

      <div className="force-graph-view" ref={containerRef}>
        <ForceGraph2D
          ref={graphRef}
          width={graphSize.width}
          height={graphSize.height}
          graphData={graphData}
          backgroundColor="#0d1016"
          nodeLabel={(node) => (node as KnowledgeGraphNode).title}
          nodeRelSize={8}
          linkColor={(link) => {
            const graphLink = link as KnowledgeGraphLink;
            const sourceId = getNodeId(graphLink.source);
            const targetId = getNodeId(graphLink.target);

            const isNeighbor =
              sourceId === selectedNote.title ||
              targetId === selectedNote.title;

            return isNeighbor
              ? 'rgba(155, 124, 255, 0.75)'
              : 'rgba(145, 156, 180, 0.22)';
          }}
          linkWidth={(link) => {
            const graphLink = link as KnowledgeGraphLink;
            const sourceId = getNodeId(graphLink.source);
            const targetId = getNodeId(graphLink.target);

            return sourceId === selectedNote.title ||
              targetId === selectedNote.title
              ? 2.2
              : 1.2;
          }}
          linkDirectionalParticles={3}
          linkDirectionalParticleWidth={2}
          linkDirectionalParticleSpeed={0.008}
          cooldownTicks={120}
          d3VelocityDecay={0.25}
          enableNodeDrag
          onEngineStop={() => {
            graphRef.current?.zoomToFit(700, 90);
          }}
          onNodeClick={(node) => {
            const graphNode = node as KnowledgeGraphNode;
            const targetNote = notes.find((note) => note.title === graphNode.title);

            if (targetNote) {
              openNote(targetNote);
            }
          }}
          nodeCanvasObject={(node, ctx, globalScale) => {
            const graphNode = node as KnowledgeGraphNode;

            const x = node.x ?? 0;
            const y = node.y ?? 0;
            const isActive = graphNode.active;
            const isNeighbor = activeNodeIds.has(graphNode.id);
            const isGhost = !graphNode.exists;

            const label = graphNode.title;
            const fontSize = Math.max(13 / globalScale, 4.5);
            const radius = isActive ? 12 : isNeighbor ? 8 : isGhost ? 5 : 6;
            const opacity = isNeighbor ? 1 : 0.42;

            if (isActive) {
              const glow = ctx.createRadialGradient(x, y, radius, x, y, radius + 30);
              glow.addColorStop(0, 'rgba(155, 124, 255, 0.65)');
              glow.addColorStop(1, 'rgba(155, 124, 255, 0)');

              ctx.beginPath();
              ctx.arc(x, y, radius + 30, 0, 2 * Math.PI);
              ctx.fillStyle = glow;
              ctx.fill();
            }

            ctx.beginPath();
            ctx.arc(x, y, radius, 0, 2 * Math.PI);
            ctx.fillStyle = isActive
              ? '#9b7cff'
              : isGhost
                ? `rgba(111, 119, 136, ${opacity})`
                : isNeighbor
                  ? '#d5dbeb'
                  : `rgba(196, 200, 212, ${opacity})`;
            ctx.fill();

            ctx.font = `700 ${fontSize}px Arial`;
            ctx.textAlign = 'center';
            ctx.textBaseline = 'top';
            ctx.fillStyle = isGhost
              ? `rgba(125, 132, 148, ${opacity})`
              : isNeighbor
                ? '#f0f3ff'
                : `rgba(215, 220, 232, ${opacity})`;

            ctx.fillText(label, x, y + radius + 8);
          }}
        />
      </div>
    </div>
  );
}

export default GraphView;