import * as React from "react"
import { Handle, Position } from "reactflow"
import { cn } from "@/lib/utils"

interface NodeData {
  text: string
  lemma: string
  upos: string
  feats?: string
  segments?: string[]
  hasError?: boolean
  errorMessage?: string
}

const POS_STYLES: Record<string, string> = {
  VERB: "text-primary",
  NOUN: "text-foreground",
  ADJ: "text-foreground",
  ADV: "text-foreground",
  DET: "text-muted-foreground",
  ADP: "text-muted-foreground",
  PRON: "text-foreground",
  CCONJ: "text-muted-foreground",
  SCONJ: "text-muted-foreground",
  PUNCT: "text-muted-foreground",
  AUX: "text-primary/70",
  PART: "text-muted-foreground",
  NUM: "text-foreground",
  INTJ: "text-foreground",
}

export function WordNode({ data, selected }: { data: NodeData; selected: boolean }) {
  const posColor = POS_STYLES[data.upos] || "text-foreground"

  return (
    <div className="relative group">
      <div
        className={cn(
          "relative z-10 min-w-[100px] rounded-lg border bg-card p-3 transition-all",
          data.hasError
            ? "border-error ring-1 ring-error/20"
            : selected
            ? "border-primary ring-1 ring-primary/20"
            : "border-border hover:border-primary/40",
          "flex flex-col items-center justify-center gap-1"
        )}
      >
        <Handle
          type="target"
          position={Position.Top}
          className="!bg-border !w-2 !h-2 !border-0"
        />

        <div className={cn(
          "font-medium text-base",
          data.hasError && "text-error line-through",
          !data.hasError && posColor,
        )}>
          {data.text}
        </div>
        <div className="text-xs text-muted-foreground italic">{data.lemma}</div>
        <div className="mt-0.5 text-[10px] font-mono tracking-wider uppercase text-muted-foreground">
          {data.upos}
        </div>

        {data.segments && (
          <div className="mt-1.5 flex flex-wrap justify-center gap-1 border-t border-border pt-1.5">
            {data.segments.map((seg, i) => (
              <span
                key={i}
                className="rounded bg-surface-2 px-1 py-0.5 text-[10px] text-muted-foreground"
              >
                {seg}
              </span>
            ))}
          </div>
        )}

        {data.hasError && data.errorMessage && (
          <div className="mt-1 rounded px-1.5 py-0.5 text-[10px] bg-error-light text-error max-w-[160px] text-center">
            {data.errorMessage}
          </div>
        )}

        <Handle
          type="source"
          position={Position.Bottom}
          className="!bg-border !w-2 !h-2 !border-0"
        />
      </div>

      {/* Morphology details on select */}
      <div
        className={cn(
          "absolute top-full left-0 right-0 pt-1 transition-all duration-200 origin-top",
          selected
            ? "opacity-100 translate-y-0 z-20 pointer-events-auto"
            : "opacity-0 -translate-y-2 pointer-events-none z-0"
        )}
        style={{ transitionTimingFunction: "var(--ease-out-quart)" }}
      >
        {data.feats && (
          <div className="rounded-lg border border-border bg-card p-2.5 shadow-sm flex flex-col items-center gap-1.5">
            <div className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider">
              Morphology
            </div>
            <div className="flex flex-wrap justify-center gap-1">
              {data.feats.split("|").map((feat, i) => (
                <span
                  key={i}
                  className="rounded bg-primary/8 px-1.5 py-0.5 text-[10px] text-primary whitespace-nowrap"
                >
                  {feat}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
