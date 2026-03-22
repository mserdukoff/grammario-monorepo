import * as React from "react"
import { Handle, Position } from "reactflow"
import { cn } from "@/lib/utils"

interface NodeData {
  text: string
  lemma: string
  upos: string
  feats?: string
  segments?: string[]
  frequency_band?: number
  hasError?: boolean
  errorMessage?: string
}

const FREQUENCY_STYLES: Record<number, { bg: string; border: string; label: string }> = {
  1: { bg: "bg-emerald-500/10", border: "border-emerald-500/30", label: "Very Common" },
  2: { bg: "bg-green-500/10", border: "border-green-500/20", label: "Common" },
  3: { bg: "bg-yellow-500/10", border: "border-yellow-500/20", label: "Intermediate" },
  4: { bg: "bg-orange-500/10", border: "border-orange-500/20", label: "Uncommon" },
  5: { bg: "bg-red-500/10", border: "border-red-500/30", label: "Rare" },
}

const FREQUENCY_DOT_COLORS: Record<number, string> = {
  1: "bg-emerald-400",
  2: "bg-green-400",
  3: "bg-yellow-400",
  4: "bg-orange-400",
  5: "bg-red-400",
}

export function WordNode({ data, selected }: { data: NodeData; selected: boolean }) {
  const freqStyle = data.frequency_band ? FREQUENCY_STYLES[data.frequency_band] : null
  const dotColor = data.frequency_band ? FREQUENCY_DOT_COLORS[data.frequency_band] : null

  return (
    <div className="relative group">
      {/* Main Card */}
      <div
        className={cn(
          "relative z-10 min-w-[120px] rounded-lg border-2 bg-background p-3 shadow-sm transition-colors",
          data.hasError
            ? "border-red-500/60 ring-2 ring-red-500/20"
            : selected
            ? "border-primary ring-2 ring-primary/20"
            : "border-border hover:border-primary/50",
          "flex flex-col items-center justify-center gap-1"
        )}
      >
        <Handle
          type="target"
          position={Position.Top}
          className="!bg-muted-foreground w-3 h-3"
        />

        {/* Frequency dot indicator */}
        {dotColor && (
          <div className="absolute top-1.5 right-1.5 flex items-center gap-1">
            <div className={cn("w-2 h-2 rounded-full", dotColor)} title={freqStyle?.label} />
          </div>
        )}

        <div className={cn("font-bold text-lg", data.hasError && "text-red-300 line-through decoration-red-500/50")}>
          {data.text}
        </div>
        <div className="text-xs text-muted-foreground italic">{data.lemma}</div>
        <div className="mt-1 rounded bg-secondary px-2 py-0.5 text-xs font-mono font-medium text-secondary-foreground">
          {data.upos}
        </div>

        {/* Frequency band label */}
        {freqStyle && (
          <div className={cn("mt-1 rounded px-1.5 py-0.5 text-[9px] font-medium", freqStyle.bg, freqStyle.border, "border")}>
            {freqStyle.label}
          </div>
        )}

        {data.segments && (
          <div className="mt-2 flex flex-wrap justify-center gap-1 border-t border-border pt-2">
            {data.segments.map((seg, i) => (
              <span
                key={i}
                className="rounded bg-accent/50 px-1 py-0.5 text-[10px] text-accent-foreground"
              >
                {seg}
              </span>
            ))}
          </div>
        )}

        {/* Error indicator */}
        {data.hasError && data.errorMessage && (
          <div className="mt-1 rounded px-1.5 py-0.5 text-[9px] bg-red-500/10 border border-red-500/30 text-red-300 max-w-[160px] text-center">
            {data.errorMessage}
          </div>
        )}

        <Handle
          type="source"
          position={Position.Bottom}
          className="!bg-muted-foreground w-3 h-3"
        />
      </div>

      {/* Slide-out Details */}
      <div
        className={cn(
          "absolute top-full left-0 right-0 pt-2 transition-all duration-300 ease-in-out origin-top",
          selected
            ? "opacity-100 translate-y-0 z-20 pointer-events-auto"
            : "opacity-0 -translate-y-4 pointer-events-none z-0"
        )}
      >
        {data.feats && (
          <div className="rounded-b-lg border-x-2 border-b-2 border-primary/50 bg-slate-900/90 backdrop-blur-sm p-3 shadow-lg -mt-1 pt-4 flex flex-col items-center gap-2">
            <div className="w-full text-center text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">
              Morphology
            </div>
            <div className="flex flex-wrap justify-center gap-1.5">
              {data.feats.split("|").map((feat, i) => (
                <span
                  key={i}
                  className="rounded-md bg-indigo-500/20 border border-indigo-500/30 px-2 py-0.5 text-[10px] text-indigo-300 shadow-sm whitespace-nowrap"
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
