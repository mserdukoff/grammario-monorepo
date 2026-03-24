"use client"

export function FeaturesSection() {
  return (
    <section id="features" className="border-t border-border bg-surface-1">
      <div className="container max-w-screen-xl py-20 md:py-28 space-y-24">
        <div className="max-w-2xl">
          <h2 className="font-heading text-3xl md:text-4xl italic tracking-tight mb-4">
            How it works
          </h2>
          <p className="text-muted-foreground text-lg leading-relaxed">
            Submit a sentence in any supported language. Get back a complete structural analysis with interactive visualizations, grammar explanations, and vocabulary tracking.
          </p>
        </div>

        {/* Feature 1: Dependency Parsing */}
        <div className="grid lg:grid-cols-5 gap-12 lg:gap-16 items-start">
          <div className="lg:col-span-2 space-y-4">
            <span className="text-sm font-medium text-primary">01</span>
            <h3 className="text-2xl font-semibold tracking-tight">Interactive dependency parsing</h3>
            <p className="text-muted-foreground leading-relaxed">
              Every word is analyzed for its part of speech, morphological features, and syntactic role. See exactly how words relate to each other through directed dependency graphs.
            </p>
            <ul className="space-y-2 text-muted-foreground text-sm">
              <li className="flex items-center gap-2">
                <span className="w-1 h-1 rounded-full bg-primary shrink-0" />
                Linear sentence view and tree layout modes
              </li>
              <li className="flex items-center gap-2">
                <span className="w-1 h-1 rounded-full bg-primary shrink-0" />
                Color-coded parts of speech
              </li>
              <li className="flex items-center gap-2">
                <span className="w-1 h-1 rounded-full bg-primary shrink-0" />
                Morphological breakdown per token
              </li>
            </ul>
          </div>
          <div className="lg:col-span-3">
            <div className="rounded-lg border border-border bg-card p-6 md:p-8">
              <div className="flex items-end justify-between gap-6 flex-wrap">
                {[
                  { word: "Die", lemma: "der", dep: "det", pos: "DET", head: "Katze" },
                  { word: "Katze", lemma: "Katze", dep: "nsubj", pos: "NOUN", head: "frisst" },
                  { word: "frisst", lemma: "fressen", dep: "root", pos: "VERB", head: null },
                  { word: "den", lemma: "der", dep: "det", pos: "DET", head: "Fisch" },
                  { word: "Fisch", lemma: "Fisch", dep: "obj", pos: "NOUN", head: "frisst" },
                ].map((token, i) => (
                  <div key={i} className="flex flex-col items-center gap-2 flex-1 min-w-[60px]">
                    <span className="text-xs text-muted-foreground font-mono">{token.dep}</span>
                    <span className="text-base font-medium">{token.word}</span>
                    <span className="text-[11px] text-muted-foreground italic">{token.lemma}</span>
                    <span className="text-[10px] font-mono tracking-wider text-primary/70 bg-primary/5 px-1.5 py-0.5 rounded">
                      {token.pos}
                    </span>
                  </div>
                ))}
              </div>
              <p className="text-xs text-muted-foreground mt-6 text-center font-mono">
                Die Katze frisst den Fisch. — &ldquo;The cat eats the fish.&rdquo;
              </p>
            </div>
          </div>
        </div>

        {/* Feature 2 & 3 side by side */}
        <div className="grid md:grid-cols-2 gap-12">
          <div className="space-y-4">
            <span className="text-sm font-medium text-primary">02</span>
            <h3 className="text-2xl font-semibold tracking-tight">Inflection-heavy languages</h3>
            <p className="text-muted-foreground leading-relaxed">
              German and Russian change word forms based on grammatical case. See case governance (nominative, accusative, dative, genitive) and separable verbs visualized clearly.
            </p>
            <div className="rounded-lg border border-border bg-card p-5 space-y-3">
              <div className="flex items-center gap-3 text-sm">
                <span className="px-2 py-1 rounded bg-muted font-mono text-xs">der Mann</span>
                <span className="text-muted-foreground">&rarr;</span>
                <span className="px-2 py-1 rounded bg-muted font-mono text-xs">dem Mann</span>
              </div>
              <p className="text-xs text-muted-foreground font-mono">Case: Nominative &rarr; Dative [Masculine]</p>
            </div>
          </div>

          <div className="space-y-4">
            <span className="text-sm font-medium text-primary">03</span>
            <h3 className="text-2xl font-semibold tracking-tight">Agglutinative morphology</h3>
            <p className="text-muted-foreground leading-relaxed">
              Turkish builds meaning by stacking suffixes. See how <code className="text-foreground bg-muted px-1 rounded text-sm">evlerinizden</code> decomposes into atomic parts with full glossing.
            </p>
            <div className="rounded-lg border border-border bg-card p-5 space-y-3">
              <div className="flex items-center gap-1.5 text-sm flex-wrap">
                {["ev", "ler", "iniz", "den"].map((seg, i) => (
                  <span key={i}>
                    {i > 0 && <span className="text-muted-foreground mx-0.5">+</span>}
                    <span className="px-2 py-1 rounded bg-muted font-mono text-xs">{seg}</span>
                  </span>
                ))}
              </div>
              <p className="text-xs text-muted-foreground font-mono">house + PL + 2PL.POSS + ABL</p>
            </div>
          </div>
        </div>

        {/* Feature 4: AI Teacher */}
        <div className="grid lg:grid-cols-5 gap-12 lg:gap-16 items-start">
          <div className="lg:col-span-2 space-y-4">
            <span className="text-sm font-medium text-primary">04</span>
            <h3 className="text-2xl font-semibold tracking-tight">AI-powered explanations</h3>
            <p className="text-muted-foreground leading-relaxed">
              Every analysis includes teacher&apos;s notes: translations, grammar concept breakdowns, &ldquo;why is it this way?&rdquo; explanations, and contextual tips generated by an AI tutor.
            </p>
          </div>
          <div className="lg:col-span-3 space-y-4">
            <div className="rounded-lg border border-border bg-card p-5 space-y-4">
              <div>
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-1">Translation</p>
                <p className="text-sm italic">&ldquo;The cat eats the fish.&rdquo;</p>
              </div>
              <div>
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-1">Key concept</p>
                <p className="text-sm font-medium mb-1">Definite Articles</p>
                <p className="text-sm text-muted-foreground">Italian has different articles based on gender and starting letter. &ldquo;Il&rdquo; is for masculine singular nouns starting with a consonant.</p>
              </div>
              <div>
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-1">Why &ldquo;mangia&rdquo; and not &ldquo;mangiano&rdquo;?</p>
                <p className="text-sm text-muted-foreground">The verb agrees with its singular subject &ldquo;il gatto&rdquo;. Use &ldquo;mangiano&rdquo; for plural subjects like &ldquo;i gatti&rdquo;.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
