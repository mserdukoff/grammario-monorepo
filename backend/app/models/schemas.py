"""
Pydantic schemas for the NLP API.
These define the request/response models for linguistic analysis.
"""
from typing import List, Optional, Dict
from pydantic import BaseModel, Field


class TokenNode(BaseModel):
    """A single token in the analyzed sentence."""
    id: int = Field(..., description="The 1-based index of the token in the sentence.")
    text: str = Field(..., description="The original word form.")
    lemma: Optional[str] = Field(None, description="The base form of the word.")
    upos: Optional[str] = Field(None, description="Universal Part-of-Speech tag.")
    xpos: Optional[str] = Field(None, description="Language-specific Part-of-Speech tag.")
    feats: Optional[str] = Field(None, description="Morphological features.")
    head_id: Optional[int] = Field(None, description="ID of the syntactic head.")
    deprel: Optional[str] = Field(None, description="Dependency relation to the head.")
    misc: Optional[str] = Field(None, description="Miscellaneous annotations.")
    segments: Optional[List[str]] = Field(None, description="Morphological segments (e.g., for Turkish).")
    frequency_band: Optional[int] = Field(None, description="Word frequency band: 1 (top 500) to 5 (rare, >10k).")


class GrammarConcept(BaseModel):
    """A grammar concept identified in the sentence."""
    name: str = Field(..., description="Name of the grammar concept.")
    description: str = Field(..., description="Short explanation of the concept in context.")
    related_words: List[str] = Field(..., description="Words from the sentence exemplifying this concept.")


class GrammarTip(BaseModel):
    """A specific grammar tip explaining WHY something is the way it is."""
    word: str = Field(..., description="The word or phrase this tip refers to.")
    question: str = Field(..., description="The question being answered.")
    explanation: str = Field(..., description="Clear explanation of why this form is required.")
    rule: Optional[str] = Field(None, description="The underlying grammar rule.")
    examples: Optional[List[str]] = Field(None, description="Additional examples showing this pattern.")


class LLMGrammarError(BaseModel):
    """A grammar error detected by the LLM."""
    word: str = Field(..., description="The word containing the error.")
    error_type: str = Field(..., description="Type: spelling, agreement, conjugation, case, word_order, preposition, article.")
    correction: Optional[str] = Field(None, description="The corrected form.")
    explanation: str = Field("", description="Why this is wrong and how to fix it.")


class PedagogicalData(BaseModel):
    """LLM-generated pedagogical insights for the sentence."""
    translation: str = Field(..., description="Natural sounding English translation.")
    nuance: Optional[str] = Field(None, description="Cultural or subtle linguistic nuance notes.")
    concepts: List[GrammarConcept] = Field(..., description="Key grammar concepts in the sentence.")
    tips: Optional[List[GrammarTip]] = Field(None, description="Grammar tips explaining why certain forms are used.")
    errors: Optional[List[LLMGrammarError]] = Field(None, description="Grammar errors detected by the LLM.")


class RuleBasedError(BaseModel):
    """A grammar error detected by rule-based analysis of the parse tree."""
    word: str = Field(..., description="The word flagged.")
    word_id: int = Field(..., description="Token ID of the flagged word.")
    error_type: str = Field(..., description="Error category.")
    severity: str = Field(..., description="info, warning, or error.")
    message: str = Field(..., description="Human-readable error description.")
    correction: Optional[str] = Field(None, description="Suggested correction.")
    rule: Optional[str] = Field(None, description="Grammar rule reference.")


class DifficultyInfo(BaseModel):
    """CEFR difficulty assessment for the sentence."""
    level: str = Field(..., description="CEFR level: A1, A2, B1, B2, C1, C2.")
    score: float = Field(..., description="Raw difficulty score from 0.0 to 1.0.")
    features: Optional[Dict] = Field(None, description="Linguistic features used for scoring.")


class SentenceMetadata(BaseModel):
    """Metadata about the analyzed sentence."""
    text: str = Field(..., description="Original sentence text.")
    language: str = Field(..., description="Language code (it, es, de, ru, tr).")


class SentenceAnalysis(BaseModel):
    """Complete analysis result for a sentence."""
    metadata: SentenceMetadata
    nodes: List[TokenNode]
    pedagogical_data: Optional[PedagogicalData] = Field(None, description="LLM-generated pedagogical insights.")
    difficulty: Optional[DifficultyInfo] = Field(None, description="CEFR difficulty assessment.")
    grammar_errors: Optional[List[RuleBasedError]] = Field(None, description="Rule-based grammar errors.")
    embedding: Optional[List[float]] = Field(None, description="384-dim sentence embedding vector.")


class AnalysisRequest(BaseModel):
    """Request body for sentence analysis."""
    text: str
    language: str = Field(..., pattern="^(it|es|de|ru|tr)$")
