"""
Pydantic schemas for the NLP API.
These define the request/response models for linguistic analysis.
"""
from typing import List, Optional
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


class GrammarConcept(BaseModel):
    """A grammar concept identified in the sentence."""
    name: str = Field(..., description="Name of the grammar concept (e.g., 'Dative Case', 'Clitic Pronoun').")
    description: str = Field(..., description="Short explanation of the concept in the context of this sentence.")
    related_words: List[str] = Field(..., description="List of words from the sentence that exemplify this concept.")


class GrammarTip(BaseModel):
    """A specific grammar tip explaining WHY something is the way it is."""
    word: str = Field(..., description="The word or phrase this tip refers to.")
    question: str = Field(..., description="The question being answered (e.g., 'Why -a at the end?').")
    explanation: str = Field(..., description="Clear explanation of why this grammatical form is required.")
    rule: Optional[str] = Field(None, description="The underlying grammar rule, if applicable.")
    examples: Optional[List[str]] = Field(None, description="Additional examples showing this pattern.")


class PedagogicalData(BaseModel):
    """LLM-generated pedagogical insights for the sentence."""
    translation: str = Field(..., description="Natural sounding English translation.")
    nuance: Optional[str] = Field(None, description="Cultural or subtle linguistic nuance notes.")
    concepts: List[GrammarConcept] = Field(..., description="Key grammar concepts identified in the sentence.")
    tips: Optional[List[GrammarTip]] = Field(None, description="Specific grammar tips explaining why certain forms are used.")


class SentenceMetadata(BaseModel):
    """Metadata about the analyzed sentence."""
    text: str = Field(..., description="Original sentence text.")
    language: str = Field(..., description="Language code (e.g., 'it', 'es', 'de', 'ru', 'tr').")


class SentenceAnalysis(BaseModel):
    """Complete analysis result for a sentence."""
    metadata: SentenceMetadata
    nodes: List[TokenNode]
    pedagogical_data: Optional[PedagogicalData] = Field(None, description="LLM-generated pedagogical insights.")


class AnalysisRequest(BaseModel):
    """Request body for sentence analysis."""
    text: str
    language: str = Field(..., pattern="^(it|es|de|ru|tr)$")
