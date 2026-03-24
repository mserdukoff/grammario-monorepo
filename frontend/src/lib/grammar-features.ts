/**
 * Human-readable reference for Universal Dependencies morphological features.
 * Maps raw UD "Feature=Value" tags to learner-friendly explanations.
 */

export interface GrammarFeatureInfo {
  label: string
  description: string
  example?: string
  tip?: string
  category: "mood" | "tense" | "aspect" | "voice" | "person" | "number" | "gender" | "case" | "definiteness" | "verbform" | "polarity" | "degree" | "prontype" | "animacy" | "polite" | "other"
}

export const UPOS_LABELS: Record<string, { label: string; description: string }> = {
  NOUN: { label: "Noun", description: "A word that names a person, place, thing, or idea." },
  VERB: { label: "Verb", description: "A word that expresses an action, state, or occurrence." },
  ADJ: { label: "Adjective", description: "A word that describes or modifies a noun." },
  ADV: { label: "Adverb", description: "A word that modifies a verb, adjective, or other adverb." },
  DET: { label: "Determiner", description: "A word that introduces a noun and specifies it (articles, demonstratives, possessives)." },
  ADP: { label: "Adposition", description: "A preposition or postposition that shows the relationship between a noun and other words." },
  PRON: { label: "Pronoun", description: "A word that substitutes for a noun (he, she, it, they, etc.)." },
  CCONJ: { label: "Coordinating conjunction", description: "A word that connects words, phrases, or clauses of equal rank (and, or, but)." },
  SCONJ: { label: "Subordinating conjunction", description: "A word that introduces a dependent clause (because, although, when)." },
  PUNCT: { label: "Punctuation", description: "A punctuation mark like a period, comma, or question mark." },
  AUX: { label: "Auxiliary verb", description: "A helping verb used with a main verb to form tenses, moods, or voices (be, have, will)." },
  PART: { label: "Particle", description: "A function word that doesn't fit other categories, often used with verbs (not, to, up)." },
  NUM: { label: "Numeral", description: "A word expressing a number or quantity." },
  INTJ: { label: "Interjection", description: "An exclamation or filler word (oh, wow, um)." },
  PROPN: { label: "Proper noun", description: "The name of a specific person, place, or organization." },
  SYM: { label: "Symbol", description: "A symbol like $, %, or @." },
  X: { label: "Other", description: "A word that cannot be classified into any other category." },
}

const FEATURES: Record<string, GrammarFeatureInfo> = {
  // ── Mood ──
  "Mood=Ind": {
    label: "Indicative mood",
    description: "The verb states a fact or asks a question about reality. This is the most common mood — it describes things that are, were, or will be.",
    example: "\"Il gatto mangia\" (The cat eats) — a factual statement.",
    tip: "If a sentence sounds like a plain statement or question, it's indicative.",
    category: "mood",
  },
  "Mood=Sub": {
    label: "Subjunctive mood",
    description: "The verb expresses doubt, wish, possibility, or something contrary to fact. Common in Romance languages after certain conjunctions and verbs.",
    example: "\"Credo che lui sia qui\" (I believe he is here) — 'sia' is subjunctive because it follows a verb of belief.",
    tip: "In Italian/Spanish, look for subjunctive after 'che/que' following verbs of emotion, doubt, or desire.",
    category: "mood",
  },
  "Mood=Imp": {
    label: "Imperative mood",
    description: "The verb gives a command, instruction, or request. The subject (you) is usually implied.",
    example: "\"Mangia!\" (Eat!) — a direct command.",
    tip: "Imperatives often appear without an explicit subject pronoun.",
    category: "mood",
  },
  "Mood=Cnd": {
    label: "Conditional mood",
    description: "The verb expresses what would happen under certain conditions. Used for polite requests and hypothetical situations.",
    example: "\"Mangerei la pizza\" (I would eat the pizza).",
    tip: "In Italian, conditional endings are -erei, -eresti, -erebbe, etc.",
    category: "mood",
  },

  // ── Tense ──
  "Tense=Pres": {
    label: "Present tense",
    description: "The action is happening now, or is a general truth. Also used for habitual actions and scheduled future events in some languages.",
    example: "\"Mangia il pesce\" — He eats the fish (right now, or habitually).",
    category: "tense",
  },
  "Tense=Past": {
    label: "Past tense",
    description: "The action happened before now. Different languages distinguish between simple past, imperfect, and other past sub-types.",
    example: "\"Mangiò il pesce\" — He ate the fish.",
    category: "tense",
  },
  "Tense=Fut": {
    label: "Future tense",
    description: "The action will happen after now.",
    example: "\"Mangerà il pesce\" — He will eat the fish.",
    category: "tense",
  },
  "Tense=Imp": {
    label: "Imperfect tense",
    description: "A past tense describing ongoing, habitual, or repeated actions. Unlike the simple past, it doesn't emphasize completion.",
    example: "\"Mangiava sempre il pesce\" — He always used to eat fish.",
    tip: "The imperfect sets the scene; the simple past advances the story.",
    category: "tense",
  },

  // ── Aspect ──
  "Aspect=Imp": {
    label: "Imperfective aspect",
    description: "The action is viewed as ongoing, habitual, or incomplete — without focus on its endpoint. Emphasizes the process rather than the result.",
    example: "\"Он читал книгу\" (He was reading a book) — the reading was in progress.",
    tip: "In Russian, imperfective verbs focus on the action itself; perfective verbs focus on the result.",
    category: "aspect",
  },
  "Aspect=Perf": {
    label: "Perfective aspect",
    description: "The action is viewed as complete, with a clear beginning and end. Focuses on the result rather than the process.",
    example: "\"Он прочитал книгу\" (He read/finished the book) — the reading was completed.",
    tip: "Russian perfective verbs often have prefixes (про-, с-, на-) added to imperfective stems.",
    category: "aspect",
  },
  "Aspect=Prog": {
    label: "Progressive aspect",
    description: "The action is actively in progress at the moment of speaking. Common in Turkish with the -yor suffix.",
    example: "\"Kedi balığı yiyor\" (The cat is eating the fish) — happening right now.",
    tip: "In Turkish, -yor/-iyor/-üyor/-uyor marks an action currently underway.",
    category: "aspect",
  },

  // ── Voice ──
  "Voice=Act": {
    label: "Active voice",
    description: "The subject performs the action. This is the default, most common voice.",
    example: "\"The cat eats the fish\" — the cat (subject) does the eating.",
    category: "voice",
  },
  "Voice=Pass": {
    label: "Passive voice",
    description: "The subject receives the action instead of performing it.",
    example: "\"The fish is eaten by the cat\" — the fish (subject) receives the action.",
    category: "voice",
  },

  // ── Person ──
  "Person=1": {
    label: "First person",
    description: "The speaker is the subject (I, we). The verb is conjugated to match.",
    example: "\"Io mangio\" (I eat) — first person singular.",
    category: "person",
  },
  "Person=2": {
    label: "Second person",
    description: "The listener is the subject (you). The verb is conjugated to match.",
    example: "\"Tu mangi\" (You eat) — second person singular.",
    category: "person",
  },
  "Person=3": {
    label: "Third person",
    description: "Someone or something else is the subject (he, she, it, they). The most common person in narrative text.",
    example: "\"Lui mangia\" (He eats) — third person singular.",
    category: "person",
  },

  // ── Number ──
  "Number=Sing": {
    label: "Singular",
    description: "Refers to one entity. Nouns, adjectives, determiners, and verbs may all change form to agree with singular number.",
    example: "\"Il gatto\" (The cat) — one cat.",
    category: "number",
  },
  "Number=Plur": {
    label: "Plural",
    description: "Refers to more than one entity. Most languages change word endings to mark plural.",
    example: "\"I gatti\" (The cats) — multiple cats. Both the article and noun changed.",
    tip: "In Italian, masculine plurals often end in -i, feminine in -e.",
    category: "number",
  },

  // ── Gender ──
  "Gender=Masc": {
    label: "Masculine gender",
    description: "The word has masculine grammatical gender. Articles, adjectives, and sometimes verbs must agree with this gender.",
    example: "\"Il gatto\" — 'gatto' is masculine, so the article is 'il' (not 'la').",
    tip: "Grammatical gender is often arbitrary and doesn't necessarily relate to biological sex.",
    category: "gender",
  },
  "Gender=Fem": {
    label: "Feminine gender",
    description: "The word has feminine grammatical gender. All agreeing words must take feminine forms.",
    example: "\"La gatta\" — 'gatta' is feminine, so the article is 'la' (not 'il').",
    category: "gender",
  },
  "Gender=Neut": {
    label: "Neuter gender",
    description: "The word has neuter grammatical gender. Found in German, Russian, and other languages with a three-gender system.",
    example: "\"Das Kind\" (The child) — 'Kind' is neuter in German, taking the article 'das'.",
    category: "gender",
  },

  // ── Case ──
  "Case=Nom": {
    label: "Nominative case",
    description: "The case of the subject — the person or thing performing the action. This is the 'default' or dictionary form of a noun.",
    example: "\"Die Katze frisst\" — 'Die Katze' (the cat) is the subject, so it's in nominative.",
    tip: "Ask \"who or what is doing the action?\" to find the nominative.",
    category: "case",
  },
  "Case=Acc": {
    label: "Accusative case",
    description: "The case of the direct object — the person or thing directly receiving the action.",
    example: "\"Er sieht den Mann\" — 'den Mann' (the man) is the direct object. Note 'der' changed to 'den'.",
    tip: "Ask \"who or what is being acted upon?\" to find the accusative.",
    category: "case",
  },
  "Case=Dat": {
    label: "Dative case",
    description: "The case of the indirect object — the person or thing that benefits from or is affected by the action.",
    example: "\"Ich gebe dem Mann das Buch\" — 'dem Mann' (to the man) is the indirect object.",
    tip: "Ask \"to whom or for whom?\" to find the dative.",
    category: "case",
  },
  "Case=Gen": {
    label: "Genitive case",
    description: "The case showing possession or association. Equivalent to English 'of' or apostrophe-s.",
    example: "\"Das Buch des Mannes\" — 'des Mannes' (of the man / the man's).",
    tip: "Ask \"whose?\" to find the genitive.",
    category: "case",
  },
  "Case=Ins": {
    label: "Instrumental case",
    description: "The case indicating the means or instrument by which an action is performed. Common in Russian and other Slavic languages.",
    example: "\"Я пишу ручкой\" (I write with a pen) — 'ручкой' is instrumental.",
    tip: "Ask \"with what?\" or \"by what means?\" to find the instrumental.",
    category: "case",
  },
  "Case=Loc": {
    label: "Locative case",
    description: "The case indicating location. In Russian, always used with a preposition (в, на, о).",
    example: "\"Он живёт в Москве\" (He lives in Moscow) — 'Москве' is locative.",
    category: "case",
  },
  "Case=Abl": {
    label: "Ablative case",
    description: "The case indicating movement away from something, or the source/origin. Common in Turkish with the -den/-dan suffix.",
    example: "\"evden\" (from the house) — -den marks the ablative.",
    tip: "Ask \"from where?\" or \"from what?\" to find the ablative.",
    category: "case",
  },

  // ── Definiteness ──
  "Definite=Def": {
    label: "Definite",
    description: "Refers to a specific, known entity — equivalent to English 'the'. The speaker and listener both know which one is meant.",
    example: "\"Il gatto\" (The cat) — a specific cat both speaker and listener can identify.",
    category: "definiteness",
  },
  "Definite=Ind": {
    label: "Indefinite",
    description: "Refers to a non-specific entity — equivalent to English 'a' or 'an'.",
    example: "\"Un gatto\" (A cat) — any cat, not a specific one.",
    category: "definiteness",
  },

  // ── VerbForm ──
  "VerbForm=Fin": {
    label: "Finite verb",
    description: "A verb form that is conjugated for person, number, tense, and/or mood. It can serve as the main verb of a sentence.",
    example: "\"Mangia\" (He eats) — conjugated for 3rd person singular present.",
    tip: "Finite verbs carry tense and agree with their subject. Infinitives and participles are non-finite.",
    category: "verbform",
  },
  "VerbForm=Inf": {
    label: "Infinitive",
    description: "The base, unconjugated form of a verb. In English: 'to eat'. In Italian: 'mangiare'.",
    example: "\"Voglio mangiare\" (I want to eat) — 'mangiare' is the infinitive.",
    category: "verbform",
  },
  "VerbForm=Part": {
    label: "Participle",
    description: "A verb form used as an adjective or to form compound tenses. Can be present (eating) or past (eaten).",
    example: "\"Ho mangiato\" (I have eaten) — 'mangiato' is the past participle.",
    category: "verbform",
  },
  "VerbForm=Ger": {
    label: "Gerund",
    description: "A verb form ending in -ing (English) or equivalent, used to express ongoing action.",
    example: "\"Sto mangiando\" (I am eating) — 'mangiando' is the gerund.",
    category: "verbform",
  },

  // ── Polarity ──
  "Polarity=Pos": {
    label: "Positive polarity",
    description: "The statement is affirmative (not negated).",
    example: "\"He eats\" — a positive/affirmative statement.",
    category: "polarity",
  },
  "Polarity=Neg": {
    label: "Negative polarity",
    description: "The statement is negated.",
    example: "\"He does not eat\" — a negative statement.",
    category: "polarity",
  },

  // ── PronType ──
  "PronType=Art": {
    label: "Article",
    description: "A determiner functioning as an article (the, a, an). Articles signal whether a noun is definite or indefinite.",
    example: "\"Il\" in Italian, \"der/die/das\" in German, \"el/la\" in Spanish.",
    category: "prontype",
  },
  "PronType=Prs": {
    label: "Personal pronoun",
    description: "A pronoun referring to a specific person (I, you, he, she, it, we, they).",
    category: "prontype",
  },
  "PronType=Dem": {
    label: "Demonstrative",
    description: "A word that points to a specific entity (this, that, these, those).",
    category: "prontype",
  },
  "PronType=Rel": {
    label: "Relative pronoun",
    description: "A pronoun that introduces a relative clause (who, which, that).",
    example: "\"The cat that eats\" — 'that' is a relative pronoun.",
    category: "prontype",
  },
  "PronType=Int": {
    label: "Interrogative",
    description: "A word used to ask a question (who, what, which, where).",
    category: "prontype",
  },

  // ── Animacy (Russian) ──
  "Animacy=Anim": {
    label: "Animate",
    description: "The noun refers to a living being (person, animal). In Russian, animate nouns have different accusative forms than inanimate ones.",
    example: "\"Я вижу кота\" (I see the cat) — 'кот' is animate, so accusative = genitive form.",
    tip: "In Russian, the accusative of animate masculine nouns looks like the genitive, not the nominative.",
    category: "animacy",
  },
  "Animacy=Inan": {
    label: "Inanimate",
    description: "The noun refers to a non-living thing. Inanimate nouns have simpler accusative forms.",
    example: "\"Я вижу стол\" (I see the table) — 'стол' is inanimate, so accusative = nominative.",
    category: "animacy",
  },

  // ── Polite (Turkish) ──
  "Polite=Infm": {
    label: "Informal register",
    description: "The verb form uses informal/familiar address. Used with friends, family, or people of similar age.",
    tip: "In Turkish, the informal 'sen' forms differ from the formal 'siz' forms.",
    category: "polite",
  },
  "Polite=Form": {
    label: "Formal register",
    description: "The verb form uses formal/polite address. Used with strangers, elders, or in professional settings.",
    category: "polite",
  },

  // ── Degree (Adjectives) ──
  "Degree=Pos": {
    label: "Positive degree",
    description: "The base form of an adjective or adverb, without comparison (big, fast).",
    category: "degree",
  },
  "Degree=Cmp": {
    label: "Comparative degree",
    description: "Comparing two things — the adjective shows 'more' of a quality (bigger, faster).",
    category: "degree",
  },
  "Degree=Sup": {
    label: "Superlative degree",
    description: "The highest degree — the adjective shows 'most' of a quality (biggest, fastest).",
    category: "degree",
  },
}

const CATEGORY_LABELS: Record<GrammarFeatureInfo["category"], string> = {
  mood: "Mood",
  tense: "Tense",
  aspect: "Aspect",
  voice: "Voice",
  person: "Person",
  number: "Number",
  gender: "Gender",
  case: "Case",
  definiteness: "Definiteness",
  verbform: "Verb Form",
  polarity: "Polarity",
  degree: "Degree",
  prontype: "Pronoun Type",
  animacy: "Animacy",
  polite: "Politeness",
  other: "Other",
}

export function getFeatureInfo(rawFeature: string): GrammarFeatureInfo | null {
  return FEATURES[rawFeature] || null
}

export function getCategoryLabel(category: GrammarFeatureInfo["category"]): string {
  return CATEGORY_LABELS[category] || category
}

export function humanizeFeature(rawFeature: string): string {
  const info = FEATURES[rawFeature]
  if (info) return info.label

  const [key, value] = rawFeature.split("=")
  if (!value) return rawFeature

  const humanKey: Record<string, string> = {
    Mood: "Mood",
    Tense: "Tense",
    Aspect: "Aspect",
    Voice: "Voice",
    Person: "Person",
    Number: "Number",
    Gender: "Gender",
    Case: "Case",
    Definite: "Definiteness",
    VerbForm: "Verb form",
    Polarity: "Polarity",
    PronType: "Type",
    Animacy: "Animacy",
    Polite: "Register",
    Degree: "Degree",
  }

  return `${humanKey[key] || key}: ${value}`
}

export function getUposInfo(upos: string): { label: string; description: string } | null {
  return UPOS_LABELS[upos] || null
}
