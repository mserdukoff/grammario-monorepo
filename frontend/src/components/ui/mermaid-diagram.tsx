"use client"

import { useEffect, useRef, useState } from "react"
import mermaid from "mermaid"

mermaid.initialize({
  startOnLoad: false,
  theme: "dark",
  themeVariables: {
    primaryColor: "#6366f1",
    primaryTextColor: "#e2e8f0",
    primaryBorderColor: "#4f46e5",
    lineColor: "#64748b",
    secondaryColor: "#1e293b",
    tertiaryColor: "#0f172a",
    fontFamily: "var(--font-heading), system-ui, sans-serif",
    fontSize: "14px",
    nodeBorder: "#4f46e5",
    mainBkg: "#1e293b",
    clusterBkg: "#0f172a",
    clusterBorder: "#334155",
    edgeLabelBackground: "#0f172a",
    noteTextColor: "#e2e8f0",
    noteBkgColor: "#1e293b",
    noteBorderColor: "#334155",
    actorTextColor: "#e2e8f0",
    actorBkg: "#1e293b",
    actorBorder: "#4f46e5",
    signalColor: "#64748b",
    signalTextColor: "#e2e8f0",
    sequenceNumberColor: "#e2e8f0",
  },
})

let mermaidCounter = 0

interface MermaidDiagramProps {
  chart: string
  title?: string
}

export function MermaidDiagram({ chart, title }: MermaidDiagramProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const [svg, setSvg] = useState<string>("")
  const idRef = useRef(`mermaid-${++mermaidCounter}`)

  useEffect(() => {
    let cancelled = false

    async function render() {
      try {
        const { svg: rendered } = await mermaid.render(idRef.current, chart.trim())
        if (!cancelled) setSvg(rendered)
      } catch {
        if (!cancelled) setSvg("")
      }
    }

    render()
    return () => { cancelled = true }
  }, [chart])

  return (
    <div className="my-8 rounded-xl border border-slate-800 bg-slate-900/50 p-6 overflow-x-auto">
      {title && (
        <h4 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-4">
          {title}
        </h4>
      )}
      <div
        ref={containerRef}
        className="flex justify-center [&_svg]:max-w-full"
        dangerouslySetInnerHTML={{ __html: svg }}
      />
    </div>
  )
}
