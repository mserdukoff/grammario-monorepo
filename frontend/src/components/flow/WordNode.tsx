import * as React from "react"
import { Handle, Position } from "reactflow"
import { cn } from "@/lib/utils"

interface NodeData {
  text: string
  lemma: string
  upos: string
  feats?: string
  segments?: string[]
}

export function WordNode({ data, selected }: { data: NodeData, selected: boolean }) {
  return (
    <div className="relative group">
      {/* Main Card */}
      <div className={cn(
        "relative z-10 min-w-[120px] rounded-lg border-2 bg-background p-3 shadow-sm transition-colors",
        selected ? "border-primary ring-2 ring-primary/20" : "border-border hover:border-primary/50",
        "flex flex-col items-center justify-center gap-1"
      )}>
        <Handle type="target" position={Position.Top} className="!bg-muted-foreground w-3 h-3" />
        
        <div className="font-bold text-lg">{data.text}</div>
        <div className="text-xs text-muted-foreground italic">{data.lemma}</div>
        <div className="mt-1 rounded bg-secondary px-2 py-0.5 text-xs font-mono font-medium text-secondary-foreground">
          {data.upos}
        </div>

        {data.segments && (
          <div className="mt-2 flex flex-wrap justify-center gap-1 border-t border-border pt-2">
            {data.segments.map((seg, i) => (
              <span key={i} className="rounded bg-accent/50 px-1 py-0.5 text-[10px] text-accent-foreground">
                {seg}
              </span>
            ))}
          </div>
        )}
        
        <Handle type="source" position={Position.Bottom} className="!bg-muted-foreground w-3 h-3" />
      </div>

      {/* Slide-out Details */}
      <div className={cn(
        "absolute top-full left-0 right-0 pt-2 transition-all duration-300 ease-in-out origin-top",
        selected ? "opacity-100 translate-y-0 z-20 pointer-events-auto" : "opacity-0 -translate-y-4 pointer-events-none z-0"
      )}>
        {data.feats && (
          <div className="rounded-b-lg border-x-2 border-b-2 border-primary/50 bg-slate-900/90 backdrop-blur-sm p-3 shadow-lg -mt-1 pt-4 flex flex-col items-center gap-2">
            <div className="w-full text-center text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">Morphology</div>
            <div className="flex flex-wrap justify-center gap-1.5">
              {data.feats.split('|').map((feat, i) => (
                <span key={i} className="rounded-md bg-indigo-500/20 border border-indigo-500/30 px-2 py-0.5 text-[10px] text-indigo-300 shadow-sm whitespace-nowrap">
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




