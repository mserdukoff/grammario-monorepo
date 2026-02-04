import React from "react";
import { useCurrentFrame, interpolate } from "remotion";
import { WordNode } from "./WordNode";
import type { SentenceData } from "../data/sentences";

interface SentenceFlowProps {
  sentence: SentenceData;
  startFrame?: number;
  highlightedNodeId?: string;
  showMorphologyForId?: string;
  width?: number;
  height?: number;
  nodeWidth?: number;
  showArrows?: boolean;
  scale?: number;
  layout?: "horizontal" | "vertical";
}

export const SentenceFlow: React.FC<SentenceFlowProps> = ({
  sentence,
  startFrame = 0,
  highlightedNodeId,
  showMorphologyForId,
  width = 1200,
  height = 300,
  nodeWidth = 160,
  showArrows = true,
  scale = 1,
  layout = "horizontal",
}) => {
  const frame = useCurrentFrame();
  const relativeFrame = frame - startFrame;

  const nodes = sentence.nodes;
  const nodeCount = nodes.length;

  // Card dimensions
  const cardWidth = 220;
  const cardHeight = 180; // Approximate height of a card
  const gap = layout === "vertical" ? 60 : 50;

  // Calculate positions based on layout
  const getNodePosition = (index: number) => {
    if (layout === "vertical") {
      const totalHeight = nodeCount * cardHeight + (nodeCount - 1) * gap;
      const startY = (height - totalHeight) / 2;
      return {
        x: (width - cardWidth) / 2,
        y: startY + index * (cardHeight + gap),
      };
    } else {
      const effectiveNodeWidth = cardWidth + gap;
      const totalWidth = nodeCount * cardWidth + (nodeCount - 1) * gap;
      const startX = (width - totalWidth) / 2;
      return {
        x: startX + index * effectiveNodeWidth,
        y: 80,
      };
    }
  };

  // Arrow animation delay (after all nodes are in)
  const arrowStartFrame = startFrame + nodeCount * 6 + 10;
  const arrowProgress = interpolate(
    frame - arrowStartFrame,
    [0, 20],
    [0, 1],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
  );

  // Generate arrows between connected nodes
  const renderArrows = () => {
    if (!showArrows) return null;
    
    const arrows: React.ReactNode[] = [];

    nodes.forEach((node) => {
      if (node.headId === 0) return; // Root node, no parent

      const sourceNode = nodes.find((n) => n.id === node.headId.toString());
      if (!sourceNode) return;

      const sourceIndex = nodes.findIndex((n) => n.id === sourceNode.id);
      const targetIndex = nodes.findIndex((n) => n.id === node.id);

      const sourcePos = getNodePosition(sourceIndex);
      const targetPos = getNodePosition(targetIndex);

      if (layout === "vertical") {
        // Vertical layout: arrows on the left side
        const sourceY = sourcePos.y + cardHeight / 2;
        const targetY = targetPos.y + cardHeight / 2;
        const leftEdge = sourcePos.x - 20;
        
        const arcWidth = 30 + Math.abs(targetIndex - sourceIndex) * 15;
        const midX = leftEdge - arcWidth;

        const pathD = `M ${leftEdge} ${sourceY} Q ${midX} ${(sourceY + targetY) / 2}, ${leftEdge} ${targetY}`;
        const pathLength = Math.abs(targetY - sourceY) * 1.5 + arcWidth * 2;

        arrows.push(
          <g key={`arrow-${node.id}`}>
            <path
              d={pathD}
              fill="none"
              stroke="#6366f1"
              strokeWidth={2}
              strokeDasharray={pathLength}
              strokeDashoffset={pathLength * (1 - arrowProgress)}
              opacity={arrowProgress * 0.7}
            />
            <circle
              cx={leftEdge}
              cy={targetY}
              r={4}
              fill="#6366f1"
              opacity={arrowProgress * 0.9}
            />
            <text
              x={midX - 8}
              y={(sourceY + targetY) / 2}
              textAnchor="end"
              dominantBaseline="middle"
              fill="#94a3b8"
              fontSize={12}
              fontFamily="monospace"
              opacity={arrowProgress * 0.9}
            >
              {node.deprel}
            </text>
          </g>
        );
      } else {
        // Horizontal layout: arrows above
        const sourceX = sourcePos.x + cardWidth / 2;
        const targetX = targetPos.x + cardWidth / 2;
        const nodeY = sourcePos.y;

        const arcHeight = 30 + Math.abs(targetIndex - sourceIndex) * 20;
        const midY = nodeY - arcHeight;

        const pathD = `M ${sourceX} ${nodeY} Q ${(sourceX + targetX) / 2} ${midY}, ${targetX} ${nodeY}`;
        const pathLength = Math.abs(targetX - sourceX) * 1.5 + arcHeight * 2;

        arrows.push(
          <g key={`arrow-${node.id}`}>
            <path
              d={pathD}
              fill="none"
              stroke="#6366f1"
              strokeWidth={2}
              strokeDasharray={pathLength}
              strokeDashoffset={pathLength * (1 - arrowProgress)}
              opacity={arrowProgress * 0.7}
            />
            <circle
              cx={targetX}
              cy={nodeY}
              r={4}
              fill="#6366f1"
              opacity={arrowProgress * 0.9}
            />
            <text
              x={(sourceX + targetX) / 2}
              y={midY - 8}
              textAnchor="middle"
              fill="#94a3b8"
              fontSize={10}
              fontFamily="monospace"
              opacity={arrowProgress * 0.9}
            >
              {node.deprel}
            </text>
          </g>
        );
      }
    });

    return arrows;
  };

  return (
    <div
      style={{
        position: "relative",
        width,
        height,
        transform: `scale(${scale})`,
        transformOrigin: "center center",
      }}
    >
      {/* SVG for arrows */}
      <svg
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          width: "100%",
          height: "100%",
          pointerEvents: "none",
          overflow: "visible",
        }}
      >
        {renderArrows()}
      </svg>

      {/* Word nodes */}
      {nodes.map((token, index) => {
        const pos = getNodePosition(index);
        return (
          <WordNode
            key={token.id}
            token={token}
            index={index}
            startFrame={startFrame}
            isHighlighted={highlightedNodeId === token.id}
            showMorphology={showMorphologyForId === token.id}
            x={pos.x}
            y={pos.y}
          />
        );
      })}
    </div>
  );
};
