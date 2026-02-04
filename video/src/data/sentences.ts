export interface WordToken {
  id: string;
  text: string;
  lemma: string;
  upos: string;
  feats: string;
  headId: number;
  deprel: string;
}

export interface GrammarConcept {
  name: string;
  description: string;
  relatedWords: string[];
}

export interface PedagogicalData {
  translation: string;
  nuance: string;
  concepts: GrammarConcept[];
}

export interface SentenceData {
  text: string;
  language: string;
  languageLabel: string;
  flag: string;
  nodes: WordToken[];
  pedagogicalData: PedagogicalData;
}

export const italianSentence: SentenceData = {
  text: "Il gatto mangia il pesce.",
  language: "it",
  languageLabel: "Italian",
  flag: "🇮🇹",
  nodes: [
    {
      id: "1",
      text: "Il",
      lemma: "il",
      upos: "DET",
      feats: "Definite=Def|Gender=Masc|Number=Sing|PronType=Art",
      headId: 2,
      deprel: "det",
    },
    {
      id: "2",
      text: "gatto",
      lemma: "gatto",
      upos: "NOUN",
      feats: "Gender=Masc|Number=Sing",
      headId: 3,
      deprel: "nsubj",
    },
    {
      id: "3",
      text: "mangia",
      lemma: "mangiare",
      upos: "VERB",
      feats: "Mood=Ind|Number=Sing|Person=3|Tense=Pres|VerbForm=Fin",
      headId: 0,
      deprel: "root",
    },
    {
      id: "4",
      text: "il",
      lemma: "il",
      upos: "DET",
      feats: "Definite=Def|Gender=Masc|Number=Sing|PronType=Art",
      headId: 5,
      deprel: "det",
    },
    {
      id: "5",
      text: "pesce",
      lemma: "pesce",
      upos: "NOUN",
      feats: "Gender=Masc|Number=Sing",
      headId: 3,
      deprel: "obj",
    },
  ],
  pedagogicalData: {
    translation: "The cat eats the fish.",
    nuance: "A standard declarative sentence showing subject-verb-object order.",
    concepts: [
      {
        name: "Definite Articles",
        description:
          "Italian has different articles based on gender and starting letter. 'Il' is for masculine singular nouns starting with a consonant.",
        relatedWords: ["Il", "gatto", "pesce"],
      },
      {
        name: "Subject-Verb Agreement",
        description:
          "The verb 'mangia' (eats) agrees with the third-person singular subject 'Il gatto'.",
        relatedWords: ["mangia"],
      },
    ],
  },
};

export const germanSentence: SentenceData = {
  text: "Die Katze frisst den Fisch.",
  language: "de",
  languageLabel: "German",
  flag: "🇩🇪",
  nodes: [
    {
      id: "1",
      text: "Die",
      lemma: "der",
      upos: "DET",
      feats: "Case=Nom|Definite=Def|Gender=Fem|Number=Sing|PronType=Art",
      headId: 2,
      deprel: "det",
    },
    {
      id: "2",
      text: "Katze",
      lemma: "Katze",
      upos: "NOUN",
      feats: "Case=Nom|Gender=Fem|Number=Sing",
      headId: 3,
      deprel: "nsubj",
    },
    {
      id: "3",
      text: "frisst",
      lemma: "fressen",
      upos: "VERB",
      feats: "Mood=Ind|Number=Sing|Person=3|Tense=Pres|VerbForm=Fin",
      headId: 0,
      deprel: "root",
    },
    {
      id: "4",
      text: "den",
      lemma: "der",
      upos: "DET",
      feats: "Case=Acc|Definite=Def|Gender=Masc|Number=Sing|PronType=Art",
      headId: 5,
      deprel: "det",
    },
    {
      id: "5",
      text: "Fisch",
      lemma: "Fisch",
      upos: "NOUN",
      feats: "Case=Acc|Gender=Masc|Number=Sing",
      headId: 3,
      deprel: "obj",
    },
  ],
  pedagogicalData: {
    translation: "The cat eats the fish.",
    nuance:
      "German distinguishes between humans eating (essen) and animals eating (fressen).",
    concepts: [
      {
        name: "Accusative Case",
        description:
          "The direct object 'den Fisch' is in the accusative case. The article changes from 'der' (nominative) to 'den' (accusative).",
        relatedWords: ["den", "Fisch"],
      },
      {
        name: "Noun Capitalization",
        description: "All nouns in German are capitalized, regardless of position in the sentence.",
        relatedWords: ["Katze", "Fisch"],
      },
    ],
  },
};

// All supported languages for CTA
export const supportedLanguages = [
  { code: "it", label: "Italian", flag: "🇮🇹" },
  { code: "es", label: "Spanish", flag: "🇪🇸" },
  { code: "de", label: "German", flag: "🇩🇪" },
  { code: "ru", label: "Russian", flag: "🇷🇺" },
  { code: "tr", label: "Turkish", flag: "🇹🇷" },
];
