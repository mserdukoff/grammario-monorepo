"use client"

import { Globe, Layers, Zap } from "lucide-react"

export function FeaturesSection() {
  return (
    <section id="features" className="container py-12 md:py-24 space-y-24">
      <div className="text-center max-w-[58rem] mx-auto mb-16">
        <h2 className="font-heading text-3xl leading-[1.1] sm:text-3xl md:text-5xl font-bold mb-4">
          Linguistic DNA Deconstructed
        </h2>
        <p className="text-muted-foreground sm:text-lg sm:leading-7">
          Different language families require different analytical strategies. We've built specific engines for each.
        </p>
      </div>

      {/* Feature 1: Visual Grammar (Full Width) */}
      <div className="grid lg:grid-cols-2 gap-12 items-center">
        <div className="space-y-6">
          <div className="inline-flex items-center rounded-lg bg-indigo-500/10 px-3 py-1 text-sm font-medium text-indigo-400">
            <Zap className="mr-2 h-4 w-4" />
            Core Technology
          </div>
          <h3 className="text-3xl font-bold">Interactive Dependency Parsing</h3>
          <p className="text-lg text-muted-foreground">
            Don't just read grammar rules. See them. Our engine visualizes the hidden structure of sentences, showing you exactly how words relate to each other in real-time.
          </p>
          <ul className="space-y-3 text-muted-foreground">
            <li className="flex items-center gap-2">
              <div className="h-1.5 w-1.5 rounded-full bg-indigo-500" />
              Color-coded parts of speech
            </li>
            <li className="flex items-center gap-2">
              <div className="h-1.5 w-1.5 rounded-full bg-indigo-500" />
              Interactive dependency arrows
            </li>
            <li className="flex items-center gap-2">
              <div className="h-1.5 w-1.5 rounded-full bg-indigo-500" />
              Morphological breakdown per token
            </li>
          </ul>
        </div>
        <div className="relative rounded-xl border border-slate-800 bg-slate-900/50 p-2 shadow-2xl">
           <div className="rounded-lg overflow-hidden bg-slate-950 aspect-video flex flex-col border border-slate-800 relative group">
              <div className="absolute inset-0 bg-gradient-to-tr from-indigo-500/5 to-cyan-500/5" />
              
              {/* Fake UI Header */}
              <div className="border-b border-slate-800 bg-slate-900/80 px-4 py-2 flex items-center gap-2">
                <div className="flex gap-1.5">
                   <div className="w-2.5 h-2.5 rounded-full bg-red-500/20"></div>
                   <div className="w-2.5 h-2.5 rounded-full bg-yellow-500/20"></div>
                   <div className="w-2.5 h-2.5 rounded-full bg-green-500/20"></div>
                </div>
                <div className="ml-4 h-4 w-32 bg-slate-800 rounded-full"></div>
              </div>

              {/* Fake Content Area */}
              <div className="flex-1 p-8 flex flex-col justify-center items-center relative">
                 {/* Visual Nodes */}
                 <div className="flex gap-8 items-center relative z-10">
                    <div className="flex flex-col items-center gap-2">
                       <div className="px-3 py-1.5 rounded-lg bg-indigo-900/40 border border-indigo-500/30 text-indigo-300 font-mono text-sm">
                          SUBJECT
                       </div>
                       <div className="w-0.5 h-4 bg-slate-700"></div>
                       <div className="text-xl font-bold text-slate-200">The Cat</div>
                    </div>

                    <div className="w-16 h-0.5 bg-slate-700 relative">
                       <div className="absolute -top-3 left-1/2 -translate-x-1/2 text-[10px] text-slate-500 uppercase tracking-widest bg-slate-950 px-1">nsubj</div>
                    </div>

                    <div className="flex flex-col items-center gap-2">
                       <div className="px-3 py-1.5 rounded-lg bg-cyan-900/40 border border-cyan-500/30 text-cyan-300 font-mono text-sm">
                          VERB
                       </div>
                       <div className="w-0.5 h-4 bg-slate-700"></div>
                       <div className="text-xl font-bold text-slate-200">Eats</div>
                    </div>

                     <div className="w-16 h-0.5 bg-slate-700 relative">
                       <div className="absolute -top-3 left-1/2 -translate-x-1/2 text-[10px] text-slate-500 uppercase tracking-widest bg-slate-950 px-1">obj</div>
                    </div>

                    <div className="flex flex-col items-center gap-2">
                       <div className="px-3 py-1.5 rounded-lg bg-emerald-900/40 border border-emerald-500/30 text-emerald-300 font-mono text-sm">
                          OBJECT
                       </div>
                       <div className="w-0.5 h-4 bg-slate-700"></div>
                       <div className="text-xl font-bold text-slate-200">Fish</div>
                    </div>
                 </div>

                 {/* Background Grid */}
                 <div className="absolute inset-0 bg-[linear-gradient(to_right,#4f4f4f1a_1px,transparent_1px),linear-gradient(to_bottom,#4f4f4f1a_1px,transparent_1px)] bg-[size:16px_16px] [mask-image:radial-gradient(ellipse_60%_60%_at_50%_50%,#000_100%,transparent_100%)] pointer-events-none" />
              </div>
              
              {/* Fake UI Footer */}
               <div className="border-t border-slate-800 bg-slate-900/50 px-4 py-3 flex justify-between items-center text-xs text-slate-500 font-mono">
                  <span>ANALYSIS_COMPLETE</span>
                  <span>CONFIDENCE: 99.8%</span>
               </div>
           </div>
        </div>
      </div>

      {/* Feature 2 & 3: Specific Families */}
      <div className="grid md:grid-cols-2 gap-8">
        {/* Feature 2 */}
        <div className="group relative overflow-hidden rounded-2xl border border-slate-800 bg-slate-900/40 p-8 hover:bg-slate-900/60 transition-all">
          <div className="mb-4 inline-block rounded-lg bg-cyan-500/10 p-3 text-cyan-400">
            <Globe className="h-6 w-6" />
          </div>
          <h3 className="mb-2 text-2xl font-bold text-cyan-100">Inflection Heavy</h3>
          <p className="mb-6 text-muted-foreground">
            Perfect for German & Russian. Visualize case governance (Nom, Acc, Dat, Gen), separable verbs, and perfective/imperfective aspect distinctions instantly.
          </p>
          <div className="h-48 w-full rounded-xl bg-slate-950/50 border border-slate-800/50 p-4 relative overflow-hidden">
             {/* Abstract Visual */}
             <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/5 to-transparent" />
             <div className="flex gap-2 mb-2">
                <span className="bg-cyan-900/40 text-cyan-200 px-2 py-1 rounded text-xs border border-cyan-700/30">Der Mann</span>
                <span className="text-slate-500">→</span>
                <span className="bg-cyan-900/40 text-cyan-200 px-2 py-1 rounded text-xs border border-cyan-700/30">dem Mann</span>
             </div>
             <div className="text-xs text-slate-500 font-mono mt-2">CASE: Dative [Masculine]</div>
          </div>
        </div>

        {/* Feature 3 */}
        <div className="group relative overflow-hidden rounded-2xl border border-slate-800 bg-slate-900/40 p-8 hover:bg-slate-900/60 transition-all">
          <div className="mb-4 inline-block rounded-lg bg-emerald-500/10 p-3 text-emerald-400">
            <Layers className="h-6 w-6" />
          </div>
          <h3 className="mb-2 text-2xl font-bold text-emerald-100">Agglutinative Logic</h3>
          <p className="mb-6 text-muted-foreground">
             X-Ray vision for Turkish suffix chains. See exactly how <code>evlerinizden</code> breaks down into parts. We decompose complex words into their atomic meanings.
          </p>
          <div className="h-48 w-full rounded-xl bg-slate-950/50 border border-slate-800/50 p-4 relative overflow-hidden">
             {/* Abstract Visual */}
             <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/5 to-transparent" />
             <div className="flex flex-wrap gap-1 mt-4">
                <span className="bg-emerald-900/40 text-emerald-200 px-1.5 py-0.5 rounded text-xs border border-emerald-700/30">ev</span>
                <span className="text-slate-600">+</span>
                <span className="bg-emerald-900/40 text-emerald-200 px-1.5 py-0.5 rounded text-xs border border-emerald-700/30">ler</span>
                <span className="text-slate-600">+</span>
                <span className="bg-emerald-900/40 text-emerald-200 px-1.5 py-0.5 rounded text-xs border border-emerald-700/30">iniz</span>
                <span className="text-slate-600">+</span>
                <span className="bg-emerald-900/40 text-emerald-200 px-1.5 py-0.5 rounded text-xs border border-emerald-700/30">den</span>
             </div>
             <div className="text-xs text-slate-500 font-mono mt-2">house + PL + YOUR + ABL</div>
          </div>
        </div>
      </div>
    </section>
  )
}
