/**
 * Human-readable reference for Universal Dependencies morphological features.
 * Maps raw UD "Feature=Value" tags to learner-friendly explanations
 * with per-language examples.
 */

type LangCode = "it" | "es" | "de" | "ru" | "tr"

export interface GrammarFeatureInfo {
  label: string
  description: string
  examples: Partial<Record<LangCode, string>>
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
    examples: {
      it: "\"Il gatto mangia\" (The cat eats) — a factual statement.",
      es: "\"El gato come\" (The cat eats) — stating a fact.",
      de: "\"Die Katze frisst\" (The cat eats) — a plain statement.",
      ru: "\"Кошка ест\" (The cat eats) — describing what is happening.",
      tr: "\"Kedi yiyor\" (The cat is eating) — a factual observation.",
    },
    tip: "If a sentence sounds like a plain statement or question, it's indicative.",
    category: "mood",
  },
  "Mood=Sub": {
    label: "Subjunctive mood",
    description: "The verb expresses doubt, wish, possibility, or something contrary to fact. Common in Romance languages after certain conjunctions and verbs.",
    examples: {
      it: "\"Credo che lui sia qui\" (I believe he is here) — 'sia' is subjunctive after a verb of belief.",
      es: "\"Quiero que vengas\" (I want you to come) — 'vengas' is subjunctive after a verb of desire.",
      de: "\"Wenn ich reich wäre\" (If I were rich) — 'wäre' is Konjunktiv II.",
      ru: "\"Если бы я знал\" (If I had known) — conditional/subjunctive with 'бы'.",
    },
    tip: "In Italian/Spanish, look for subjunctive after 'che/que' following verbs of emotion, doubt, or desire.",
    category: "mood",
  },
  "Mood=Imp": {
    label: "Imperative mood",
    description: "The verb gives a command, instruction, or request. The subject (you) is usually implied.",
    examples: {
      it: "\"Mangia!\" (Eat!) — a direct command.",
      es: "\"¡Come!\" (Eat!) — a direct command.",
      de: "\"Iss!\" (Eat!) — a direct command.",
      ru: "\"Ешь!\" (Eat!) — a direct command.",
      tr: "\"Ye!\" (Eat!) — a direct command.",
    },
    tip: "Imperatives often appear without an explicit subject pronoun.",
    category: "mood",
  },
  "Mood=Cnd": {
    label: "Conditional mood",
    description: "The verb expresses what would happen under certain conditions. Used for polite requests and hypothetical situations.",
    examples: {
      it: "\"Mangerei la pizza\" (I would eat the pizza).",
      es: "\"Comería la pizza\" (I would eat the pizza).",
      de: "\"Ich würde die Pizza essen\" (I would eat the pizza).",
      ru: "\"Я бы съел пиццу\" (I would eat the pizza).",
      tr: "\"Pizza yerdim\" (I would eat pizza).",
    },
    category: "mood",
  },

  // ── Tense ──
  "Tense=Pres": {
    label: "Present tense",
    description: "The action is happening now, or is a general truth. Also used for habitual actions and scheduled future events in some languages.",
    examples: {
      it: "\"Mangia il pesce\" — He eats the fish (right now, or habitually).",
      es: "\"Come el pescado\" — He eats the fish.",
      de: "\"Er isst den Fisch\" — He eats the fish.",
      ru: "\"Он ест рыбу\" — He eats the fish.",
      tr: "\"Balık yiyor\" — He is eating the fish.",
    },
    category: "tense",
  },
  "Tense=Past": {
    label: "Past tense",
    description: "The action happened before now. Different languages distinguish between simple past, imperfect, and other past sub-types.",
    examples: {
      it: "\"Mangiò il pesce\" — He ate the fish.",
      es: "\"Comió el pescado\" — He ate the fish.",
      de: "\"Er aß den Fisch\" — He ate the fish.",
      ru: "\"Он съел рыбу\" — He ate the fish.",
      tr: "\"Balık yedi\" — He ate the fish.",
    },
    category: "tense",
  },
  "Tense=Fut": {
    label: "Future tense",
    description: "The action will happen after now.",
    examples: {
      it: "\"Mangerà il pesce\" — He will eat the fish.",
      es: "\"Comerá el pescado\" — He will eat the fish.",
      de: "\"Er wird den Fisch essen\" — He will eat the fish.",
      ru: "\"Он будет есть рыбу\" — He will eat the fish.",
      tr: "\"Balık yiyecek\" — He will eat the fish.",
    },
    category: "tense",
  },
  "Tense=Imp": {
    label: "Imperfect tense",
    description: "A past tense describing ongoing, habitual, or repeated actions. Unlike the simple past, it doesn't emphasize completion.",
    examples: {
      it: "\"Mangiava sempre il pesce\" — He always used to eat fish.",
      es: "\"Siempre comía pescado\" — He always used to eat fish.",
      de: "\"Er aß immer Fisch\" — He always used to eat fish.",
      ru: "\"Он всегда ел рыбу\" — He always used to eat fish (imperfective).",
    },
    tip: "The imperfect sets the scene; the simple past advances the story.",
    category: "tense",
  },

  // ── Aspect ──
  "Aspect=Imp": {
    label: "Imperfective aspect",
    description: "The action is viewed as ongoing, habitual, or incomplete — without focus on its endpoint. Emphasizes the process rather than the result.",
    examples: {
      ru: "\"Он читал книгу\" (He was reading a book) — the reading was in progress.",
      it: "\"Leggeva un libro\" — He was reading a book (ongoing).",
      tr: "\"Kitap okuyordu\" — He was reading a book.",
    },
    tip: "In Russian, imperfective verbs focus on the action itself; perfective verbs focus on the result.",
    category: "aspect",
  },
  "Aspect=Perf": {
    label: "Perfective aspect",
    description: "The action is viewed as complete, with a clear beginning and end. Focuses on the result rather than the process.",
    examples: {
      ru: "\"Он прочитал книгу\" (He read/finished the book) — the reading was completed.",
    },
    tip: "Russian perfective verbs often have prefixes (про-, с-, на-) added to imperfective stems.",
    category: "aspect",
  },
  "Aspect=Prog": {
    label: "Progressive aspect",
    description: "The action is actively in progress at the moment of speaking. Common in Turkish with the -yor suffix.",
    examples: {
      tr: "\"Kedi balığı yiyor\" (The cat is eating the fish) — happening right now.",
    },
    tip: "In Turkish, -yor/-iyor/-üyor/-uyor marks an action currently underway.",
    category: "aspect",
  },

  // ── Voice ──
  "Voice=Act": {
    label: "Active voice",
    description: "The subject performs the action. This is the default, most common voice.",
    examples: {
      it: "\"Il gatto mangia il pesce\" — the cat (subject) does the eating.",
      es: "\"El gato come el pescado\" — the cat does the eating.",
      de: "\"Die Katze frisst den Fisch\" — the cat does the eating.",
      ru: "\"Кошка ест рыбу\" — the cat does the eating.",
      tr: "\"Kedi balığı yiyor\" — the cat does the eating.",
    },
    category: "voice",
  },
  "Voice=Pass": {
    label: "Passive voice",
    description: "The subject receives the action instead of performing it.",
    examples: {
      it: "\"Il pesce è mangiato dal gatto\" — the fish is eaten by the cat.",
      de: "\"Der Fisch wird von der Katze gefressen\" — the fish is eaten by the cat.",
      ru: "\"Рыба съедена кошкой\" — the fish is eaten by the cat.",
    },
    category: "voice",
  },

  // ── Person ──
  "Person=1": {
    label: "First person",
    description: "The speaker is the subject (I, we). The verb is conjugated to match.",
    examples: {
      it: "\"Io mangio\" (I eat) — first person singular.",
      es: "\"Yo como\" (I eat) — first person singular.",
      de: "\"Ich esse\" (I eat) — first person singular.",
      ru: "\"Я ем\" (I eat) — first person singular.",
      tr: "\"Ben yiyorum\" (I am eating) — first person singular.",
    },
    category: "person",
  },
  "Person=2": {
    label: "Second person",
    description: "The listener is the subject (you). The verb is conjugated to match.",
    examples: {
      it: "\"Tu mangi\" (You eat) — second person singular.",
      es: "\"Tú comes\" (You eat) — second person singular.",
      de: "\"Du isst\" (You eat) — second person singular.",
      ru: "\"Ты ешь\" (You eat) — second person singular.",
      tr: "\"Sen yiyorsun\" (You are eating) — second person singular.",
    },
    category: "person",
  },
  "Person=3": {
    label: "Third person",
    description: "Someone or something else is the subject (he, she, it, they). The most common person in narrative text.",
    examples: {
      it: "\"Lui mangia\" (He eats) — third person singular.",
      es: "\"Él come\" (He eats) — third person singular.",
      de: "\"Er isst\" (He eats) — third person singular.",
      ru: "\"Он ест\" (He eats) — third person singular.",
      tr: "\"O yiyor\" (He/she is eating) — third person singular.",
    },
    category: "person",
  },

  // ── Number ──
  "Number=Sing": {
    label: "Singular",
    description: "Refers to one entity. Nouns, adjectives, determiners, and verbs may all change form to agree with singular number.",
    examples: {
      it: "\"Il gatto\" (The cat) — one cat.",
      es: "\"El gato\" (The cat) — one cat.",
      de: "\"Die Katze\" (The cat) — one cat.",
      ru: "\"Кошка\" (The cat) — one cat.",
      tr: "\"Kedi\" (The cat) — one cat.",
    },
    category: "number",
  },
  "Number=Plur": {
    label: "Plural",
    description: "Refers to more than one entity. Most languages change word endings to mark plural.",
    examples: {
      it: "\"I gatti\" (The cats) — both the article 'i' and noun 'gatti' changed from singular.",
      es: "\"Los gatos\" (The cats) — plural article 'los' and noun ending '-os'.",
      de: "\"Die Katzen\" (The cats) — plural suffix '-en'.",
      ru: "\"Кошки\" (The cats) — plural ending '-и'.",
      tr: "\"Kediler\" (The cats) — plural suffix '-ler'.",
    },
    tip: "Each language has different plural formation rules. Italian: -i/-e, German: -e/-en/-er/-s, Turkish: -ler/-lar.",
    category: "number",
  },

  // ── Gender ──
  "Gender=Masc": {
    label: "Masculine gender",
    description: "The word has masculine grammatical gender. Articles, adjectives, and sometimes verbs must agree with this gender.",
    examples: {
      it: "\"Il gatto\" — 'gatto' is masculine, so the article is 'il' (not 'la').",
      es: "\"El gato\" — 'gato' is masculine, so the article is 'el' (not 'la').",
      de: "\"Der Mann\" — 'Mann' is masculine, taking the article 'der'.",
      ru: "\"Кот\" (male cat) — masculine nouns often end in a consonant.",
    },
    tip: "Grammatical gender is often arbitrary and doesn't necessarily relate to biological sex.",
    category: "gender",
  },
  "Gender=Fem": {
    label: "Feminine gender",
    description: "The word has feminine grammatical gender. All agreeing words must take feminine forms.",
    examples: {
      it: "\"La gatta\" — 'gatta' is feminine, so the article is 'la' (not 'il').",
      es: "\"La gata\" — 'gata' is feminine, so the article is 'la'.",
      de: "\"Die Frau\" — 'Frau' is feminine, taking the article 'die'.",
      ru: "\"Кошка\" (female cat) — feminine nouns often end in -а/-я.",
    },
    category: "gender",
  },
  "Gender=Neut": {
    label: "Neuter gender",
    description: "The word has neuter grammatical gender. Found in German, Russian, and other languages with a three-gender system.",
    examples: {
      de: "\"Das Kind\" (The child) — 'Kind' is neuter, taking the article 'das'.",
      ru: "\"Окно\" (The window) — neuter nouns often end in -о/-е.",
    },
    category: "gender",
  },

  // ── Case ──
  "Case=Nom": {
    label: "Nominative case",
    description: "The case of the subject — the person or thing performing the action. This is the 'default' or dictionary form of a noun.",
    examples: {
      de: "\"Die Katze frisst\" — 'Die Katze' (the cat) is the subject, so it's in nominative.",
      ru: "\"Кошка ест\" — 'Кошка' is the subject performing the action.",
      tr: "\"Kedi yiyor\" — 'Kedi' is the subject, unmarked (nominative is the base form).",
    },
    tip: "Ask \"who or what is doing the action?\" to find the nominative.",
    category: "case",
  },
  "Case=Acc": {
    label: "Accusative case",
    description: "The case of the direct object — the person or thing directly receiving the action.",
    examples: {
      de: "\"Er sieht den Mann\" — 'den Mann' is the direct object. Note 'der' changed to 'den'.",
      ru: "\"Я вижу кошку\" (I see the cat) — 'кошку' is accusative (changed from 'кошка').",
      tr: "\"Balığı yiyor\" (He's eating the fish) — 'balığı' has the accusative suffix '-ı'.",
    },
    tip: "Ask \"who or what is being acted upon?\" to find the accusative.",
    category: "case",
  },
  "Case=Dat": {
    label: "Dative case",
    description: "The case of the indirect object — the person or thing that benefits from or is affected by the action.",
    examples: {
      de: "\"Ich gebe dem Mann das Buch\" — 'dem Mann' (to the man) is the indirect object.",
      ru: "\"Я дал кошке рыбу\" (I gave the cat fish) — 'кошке' is dative.",
      tr: "\"Kediye balık verdim\" (I gave fish to the cat) — 'kediye' has the dative suffix '-ye'.",
    },
    tip: "Ask \"to whom or for whom?\" to find the dative.",
    category: "case",
  },
  "Case=Gen": {
    label: "Genitive case",
    description: "The case showing possession or association. Equivalent to English 'of' or apostrophe-s.",
    examples: {
      de: "\"Das Buch des Mannes\" — 'des Mannes' (of the man / the man's).",
      ru: "\"Книга кошки\" (The cat's book) — 'кошки' is genitive.",
      tr: "\"Kedinin balığı\" (The cat's fish) — 'kedinin' has the genitive suffix '-nin'.",
    },
    tip: "Ask \"whose?\" to find the genitive.",
    category: "case",
  },
  "Case=Ins": {
    label: "Instrumental case",
    description: "The case indicating the means or instrument by which an action is performed. Common in Russian and other Slavic languages.",
    examples: {
      ru: "\"Я пишу ручкой\" (I write with a pen) — 'ручкой' is instrumental.",
    },
    tip: "Ask \"with what?\" or \"by what means?\" to find the instrumental.",
    category: "case",
  },
  "Case=Loc": {
    label: "Locative case",
    description: "The case indicating location. In Russian, always used with a preposition (в, на, о).",
    examples: {
      ru: "\"Он живёт в Москве\" (He lives in Moscow) — 'Москве' is locative.",
      tr: "\"Evde\" (At home) — '-de' is the locative suffix.",
    },
    category: "case",
  },
  "Case=Abl": {
    label: "Ablative case",
    description: "The case indicating movement away from something, or the source/origin. Common in Turkish with the -den/-dan suffix.",
    examples: {
      tr: "\"Evden geliyorum\" (I'm coming from the house) — '-den' marks the ablative.",
    },
    tip: "Ask \"from where?\" or \"from what?\" to find the ablative.",
    category: "case",
  },

  // ── Definiteness ──
  "Definite=Def": {
    label: "Definite",
    description: "Refers to a specific, known entity — equivalent to English 'the'. The speaker and listener both know which one is meant.",
    examples: {
      it: "\"Il gatto\" (The cat) — a specific cat both speaker and listener can identify.",
      es: "\"El gato\" (The cat) — a specific, known cat.",
      de: "\"Die Katze\" (The cat) — definite article 'die'.",
    },
    category: "definiteness",
  },
  "Definite=Ind": {
    label: "Indefinite",
    description: "Refers to a non-specific entity — equivalent to English 'a' or 'an'.",
    examples: {
      it: "\"Un gatto\" (A cat) — any cat, not a specific one.",
      es: "\"Un gato\" (A cat) — indefinite article 'un'.",
      de: "\"Eine Katze\" (A cat) — indefinite article 'eine'.",
    },
    category: "definiteness",
  },

  // ── VerbForm ──
  "VerbForm=Fin": {
    label: "Finite verb",
    description: "A verb form that is conjugated for person, number, tense, and/or mood. It can serve as the main verb of a sentence.",
    examples: {
      it: "\"Mangia\" (He eats) — conjugated for 3rd person singular present.",
      es: "\"Come\" (He eats) — conjugated finite form.",
      de: "\"Isst\" (He eats) — conjugated finite form.",
      ru: "\"Ест\" (He eats) — conjugated finite form.",
      tr: "\"Yiyor\" (He is eating) — conjugated finite form.",
    },
    tip: "Finite verbs carry tense and agree with their subject. Infinitives and participles are non-finite.",
    category: "verbform",
  },
  "VerbForm=Inf": {
    label: "Infinitive",
    description: "The base, unconjugated form of a verb. In English: 'to eat'.",
    examples: {
      it: "\"Voglio mangiare\" (I want to eat) — 'mangiare' is the infinitive.",
      es: "\"Quiero comer\" (I want to eat) — 'comer' is the infinitive.",
      de: "\"Ich will essen\" (I want to eat) — 'essen' is the infinitive.",
      ru: "\"Я хочу есть\" (I want to eat) — 'есть' is the infinitive.",
      tr: "\"Yemek istiyorum\" (I want to eat) — 'yemek' is the infinitive.",
    },
    category: "verbform",
  },
  "VerbForm=Part": {
    label: "Participle",
    description: "A verb form used as an adjective or to form compound tenses. Can be present (eating) or past (eaten).",
    examples: {
      it: "\"Ho mangiato\" (I have eaten) — 'mangiato' is the past participle.",
      es: "\"He comido\" (I have eaten) — 'comido' is the past participle.",
      de: "\"Ich habe gegessen\" (I have eaten) — 'gegessen' is the past participle.",
      ru: "\"Съеденный\" (eaten) — past passive participle.",
    },
    category: "verbform",
  },
  "VerbForm=Ger": {
    label: "Gerund",
    description: "A verb form ending in -ing (English) or equivalent, used to express ongoing action.",
    examples: {
      it: "\"Sto mangiando\" (I am eating) — 'mangiando' is the gerund.",
      es: "\"Estoy comiendo\" (I am eating) — 'comiendo' is the gerund.",
    },
    category: "verbform",
  },

  // ── Polarity ──
  "Polarity=Pos": {
    label: "Positive polarity",
    description: "The statement is affirmative (not negated).",
    examples: {
      it: "\"Mangia\" (He eats) — an affirmative statement.",
      ru: "\"Он ест\" (He eats) — affirmative.",
      tr: "\"Yiyor\" (He is eating) — positive polarity.",
    },
    category: "polarity",
  },
  "Polarity=Neg": {
    label: "Negative polarity",
    description: "The statement is negated.",
    examples: {
      it: "\"Non mangia\" (He does not eat) — negated with 'non'.",
      ru: "\"Он не ест\" (He does not eat) — negated with 'не'.",
      tr: "\"Yemiyor\" (He is not eating) — negative suffix changes the verb.",
    },
    category: "polarity",
  },

  // ── PronType ──
  "PronType=Art": {
    label: "Article",
    description: "A determiner functioning as an article (the, a, an). Articles signal whether a noun is definite or indefinite.",
    examples: {
      it: "\"Il\" / \"La\" / \"Un\" — Italian definite and indefinite articles.",
      es: "\"El\" / \"La\" / \"Un\" — Spanish definite and indefinite articles.",
      de: "\"Der\" / \"Die\" / \"Das\" / \"Ein\" — German articles vary by gender and case.",
    },
    category: "prontype",
  },
  "PronType=Prs": {
    label: "Personal pronoun",
    description: "A pronoun referring to a specific person (I, you, he, she, it, we, they).",
    examples: {
      it: "\"Io, tu, lui, lei, noi, voi, loro\" — Italian personal pronouns.",
      ru: "\"Я, ты, он, она, мы, вы, они\" — Russian personal pronouns.",
    },
    category: "prontype",
  },
  "PronType=Dem": {
    label: "Demonstrative",
    description: "A word that points to a specific entity (this, that, these, those).",
    examples: {
      it: "\"Questo gatto\" (This cat) / \"Quel gatto\" (That cat).",
      de: "\"Diese Katze\" (This cat) / \"Jene Katze\" (That cat).",
    },
    category: "prontype",
  },
  "PronType=Rel": {
    label: "Relative pronoun",
    description: "A pronoun that introduces a relative clause (who, which, that).",
    examples: {
      it: "\"Il gatto che mangia\" (The cat that eats) — 'che' is a relative pronoun.",
      de: "\"Die Katze, die frisst\" (The cat that eats) — 'die' is a relative pronoun.",
    },
    category: "prontype",
  },
  "PronType=Int": {
    label: "Interrogative",
    description: "A word used to ask a question (who, what, which, where).",
    examples: {
      it: "\"Chi?\" (Who?), \"Che cosa?\" (What?)",
      ru: "\"Кто?\" (Who?), \"Что?\" (What?)",
    },
    category: "prontype",
  },

  // ── Animacy (Russian) ──
  "Animacy=Anim": {
    label: "Animate",
    description: "The noun refers to a living being (person, animal). In Russian, animate nouns have different accusative forms than inanimate ones.",
    examples: {
      ru: "\"Я вижу кота\" (I see the cat) — 'кот' is animate, so accusative = genitive form ('кота', not 'кот').",
    },
    tip: "In Russian, the accusative of animate masculine nouns looks like the genitive, not the nominative.",
    category: "animacy",
  },
  "Animacy=Inan": {
    label: "Inanimate",
    description: "The noun refers to a non-living thing. Inanimate nouns have simpler accusative forms.",
    examples: {
      ru: "\"Я вижу стол\" (I see the table) — 'стол' is inanimate, so accusative = nominative form.",
    },
    category: "animacy",
  },

  // ── Polite (Turkish) ──
  "Polite=Infm": {
    label: "Informal register",
    description: "The verb form uses informal/familiar address. Used with friends, family, or people of similar age.",
    examples: {
      tr: "\"Sen geliyorsun\" (You are coming) — informal 'sen' form.",
    },
    tip: "In Turkish, the informal 'sen' forms differ from the formal 'siz' forms.",
    category: "polite",
  },
  "Polite=Form": {
    label: "Formal register",
    description: "The verb form uses formal/polite address. Used with strangers, elders, or in professional settings.",
    examples: {
      tr: "\"Siz geliyorsunuz\" (You are coming) — formal 'siz' form.",
    },
    category: "polite",
  },

  // ── Degree (Adjectives) ──
  "Degree=Pos": {
    label: "Positive degree",
    description: "The base form of an adjective or adverb, without comparison (big, fast).",
    examples: {
      it: "\"Grande\" (big) — the basic form.",
      de: "\"Groß\" (big) — the basic form.",
      ru: "\"Большой\" (big) — the basic form.",
    },
    category: "degree",
  },
  "Degree=Cmp": {
    label: "Comparative degree",
    description: "Comparing two things — the adjective shows 'more' of a quality (bigger, faster).",
    examples: {
      it: "\"Più grande\" (bigger).",
      de: "\"Größer\" (bigger) — suffix '-er'.",
      ru: "\"Больше\" (bigger).",
    },
    category: "degree",
  },
  "Degree=Sup": {
    label: "Superlative degree",
    description: "The highest degree — the adjective shows 'most' of a quality (biggest, fastest).",
    examples: {
      it: "\"Il più grande\" (the biggest).",
      de: "\"Am größten\" (the biggest).",
      ru: "\"Самый большой\" (the biggest).",
    },
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

export function getFeatureExample(info: GrammarFeatureInfo, lang: string): string | null {
  const example = info.examples[lang as LangCode]
  if (example) return example

  const fallbackOrder: LangCode[] = ["it", "es", "de", "ru", "tr"]
  for (const fallback of fallbackOrder) {
    if (info.examples[fallback]) return info.examples[fallback]!
  }
  return null
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
