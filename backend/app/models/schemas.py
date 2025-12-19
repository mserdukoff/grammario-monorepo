from typing import List, Optional, Any
from pydantic import BaseModel, Field

class TokenNode(BaseModel):
    id: int = Field(..., description="The 1-based index of the token in the sentence.")
    text: str = Field(..., description="The original word form.")
    lemma: Optional[str] = Field(None, description="The base form of the word.")
    upos: Optional[str] = Field(None, description="Universal Part-of-Speech tag.")
    xpos: Optional[str] = Field(None, description="Language-specific Part-of-Speech tag.")
    feats: Optional[str] = Field(None, description="Morphological features.")
    head_id: Optional[int] = Field(None, description="ID of the syntactic head.")
    deprel: Optional[str] = Field(None, description="Dependency relation to the head.")
    misc: Optional[str] = Field(None, description="Miscellaneous annotations.")
    
    # Placeholder for Turkish segments later
    segments: Optional[List[str]] = Field(None, description="Morphological segments (e.g., for Turkish).")

class GrammarConcept(BaseModel):
    name: str = Field(..., description="Name of the grammar concept (e.g., 'Dative Case', 'Clitic Pronoun').")
    description: str = Field(..., description="Short explanation of the concept in the context of this sentence.")
    related_words: List[str] = Field(..., description="List of words from the sentence that exemplify this concept.")

class PedagogicalData(BaseModel):
    translation: str = Field(..., description="Natural sounding English translation.")
    nuance: Optional[str] = Field(None, description="Cultural or subtle linguistic nuance notes.")
    concepts: List[GrammarConcept] = Field(..., description="Key grammar concepts identified in the sentence.")

class SentenceMetadata(BaseModel):
    text: str = Field(..., description="Original sentence text.")
    language: str = Field(..., description="Language code (e.g., 'it', 'es', 'de', 'ru', 'tr').")

class SentenceAnalysis(BaseModel):
    metadata: SentenceMetadata
    nodes: List[TokenNode]
    pedagogical_data: Optional[PedagogicalData] = Field(None, description="LLM-generated pedagogical insights.")

class AnalysisRequest(BaseModel):
    text: str
    language: str = Field(..., pattern="^(it|es|de|ru|tr)$")
