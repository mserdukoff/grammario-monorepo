from abc import ABC, abstractmethod
from typing import List, Any
from app.models.schemas import TokenNode


class AnalysisStrategy(ABC):
    """Abstract base class for language-specific analysis strategies."""

    @abstractmethod
    def process(self, doc: Any) -> List[TokenNode]:
        pass

    def _convert_stanza_word_to_node(self, word: Any, sent_offset: int = 0) -> TokenNode:
        """Convert a Stanza word object to TokenNode."""
        raw_head_id = word.head if word.head is not None else 0

        word_id = (word.id if isinstance(word.id, int) else int(word.id[0]) if isinstance(word.id, tuple) else 0)
        final_id = word_id + sent_offset
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

    def _convert_spacy_token_to_node(self, token: Any, offset: int = 0) -> TokenNode:
        """Convert a spaCy Token to TokenNode."""
        feats_str = None
        if token.morph and str(token.morph):
            feats_str = str(token.morph)

        head_id = 0 if token.head == token else (token.head.i - token.sent.start + 1 + offset)

        return TokenNode(
            id=token.i - token.sent.start + 1 + offset,
            text=token.text,
            lemma=token.lemma_,
            upos=token.pos_,
            xpos=token.tag_,
            feats=feats_str,
            head_id=head_id,
            deprel=token.dep_,
            misc=None
        )

    def process_spacy(self, doc: Any) -> List[TokenNode]:
        """Default spaCy processing -- subclasses can override for language-specific logic."""
        nodes = []
        sent_offset = 0
        for sent in doc.sents:
            for token in sent:
                if token.pos_ == "PUNCT" or token.pos_ == "SPACE":
                    continue
                node = self._convert_spacy_token_to_node(token, sent_offset)
                nodes.append(node)
            sent_offset += len([t for t in sent if t.pos_ not in ("PUNCT", "SPACE")])
        return nodes




