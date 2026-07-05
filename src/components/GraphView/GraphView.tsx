import ForceGraph2D from 'react-force-graph-2d';
import type { Note } from '../../types/note';
import { buildKnowledgeGraph, type KnowledgeGraphNode } from '../../utils/graph';

type GraphViewProps = {
  notes: Note[];
  selectedNote: Note;
  openNote: (note: Note) => void;
};

function GraphView({ notes, selectedNote, openNote }: GraphViewProps) {
  const graphData = buildKnowledgeGraph(notes, selectedNote);

  return (
    <div className="graph-section graph-section-full">
      <h3>Граф связей</h3>

      <div className="force-graph-view">
        <ForceGraph2D
          graphData={graphData}
          backgroundColor="#0d1016"
          nodeLabel={(node) => (node as KnowledgeGraphNode).title}
          nodeRelSize={5}
          linkColor={() => 'rgba(155, 124, 255, 0.35)'}
          linkWidth={1.4}
          linkDirectionalParticles={2}
          linkDirectionalParticleWidth={1.5}
          linkDirectionalParticleSpeed={0.006}
          cooldownTicks={80}
          onNodeClick={(node) => {
            const graphNode = node as KnowledgeGraphNode;
            const targetNote = notes.find((note) => note.title === graphNode.title);

            if (targetNote) {
              openNote(targetNote);
            }
          }}
          nodeCanvasObject={(node, ctx, globalScale) => {
            const graphNode = node as KnowledgeGraphNode;

            const label = graphNode.title;
            const fontSize = Math.max(10 / globalScale, 3.5);
            const radius = graphNode.active ? 7 : graphNode.exists ? 5 : 4;

            ctx.beginPath();
            ctx.arc(node.x ?? 0, node.y ?? 0, radius, 0, 2 * Math.PI, false);
            ctx.fillStyle = graphNode.active
              ? '#9b7cff'
              : graphNode.exists
                ? '#c4c8d4'
                : '#6f7788';
            ctx.fill();

            if (graphNode.active) {
              ctx.beginPath();
              ctx.arc(node.x ?? 0, node.y ?? 0, radius + 5, 0, 2 * Math.PI, false);
              ctx.strokeStyle = 'rgba(155, 124, 255, 0.55)';
              ctx.lineWidth = 2;
              ctx.stroke();
            }

            ctx.font = `${fontSize}px Arial`;
            ctx.textAlign = 'center';
            ctx.textBaseline = 'top';
            ctx.fillStyle = graphNode.exists ? '#d7dce8' : '#7d8494';
            ctx.fillText(label, node.x ?? 0, (node.y ?? 0) + radius + 5);
          }}
        />
      </div>
    </div>
  );
}

export default GraphView;