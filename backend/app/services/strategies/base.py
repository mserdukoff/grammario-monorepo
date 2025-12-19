from abc import ABC, abstractmethod
from typing import List, Any
from app.models.schemas import TokenNode

class AnalysisStrategy(ABC):
    """
    Abstract base class for language-specific analysis strategies.
    """

    @abstractmethod
    def process(self, doc: Any) -> List[TokenNode]:
        """
        Process the Stanza document and return a list of TokenNodes.
        
        Args:
            doc: The Stanza Document object.
            
        Returns:
            List[TokenNode]: The structured analysis result.
        """
        pass

    def _convert_stanza_word_to_node(self, word: Any, sent_offset: int = 0) -> TokenNode:
        """
        Helper to convert a Stanza word object to our TokenNode model.
        """
        # Handle None values gracefully as per requirements
        raw_head_id = word.head if word.head is not None else 0
        
        # Calculate IDs with offset
        # Note: Stanza uses 1-based indexing for heads, 0 for root.
        # If raw_head_id is 0 (root), it should remain 0 (or point to itself? No, usually 0 for root).
        # But if we have multiple sentences, we probably want the root to still be 0? 
        # Or do we want a global root? 
        # Typically dependency trees have 0 as root. 
        # But if we flatten multiple sentences, we might have multiple roots.
        
        # Current word ID
        word_id = (word.id if isinstance(word.id, int) else int(word.id[0]) if isinstance(word.id, tuple) else 0)
        final_id = word_id + sent_offset
        
        # Head ID
        # If head is 0, it stays 0 (Root). 
        # If head is > 0, it points to another word in the SAME sentence, so we add offset.
        final_head_id = (raw_head_id + sent_offset) if raw_head_id > 0 else 0

        return TokenNode(
            id=final_id,
            text=word.text or "",
            lemma=word.lemma,
            upos=word.upos,
            xpos=word.xpos,
            feats=word.feats,
            head_id=final_head_id,
            deprel=word.deprel,
            misc=word.misc
        )




