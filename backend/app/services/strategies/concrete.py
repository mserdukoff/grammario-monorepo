from typing import List, Any, Dict
from app.services.strategies.base import AnalysisStrategy
from app.models.schemas import TokenNode

class RomanceStrategy(AnalysisStrategy):
    """
    Strategy for Romance languages (Italian, Spanish).
    Focus: Clitics, MWT expansion, Gender/Number agreement.
    """
    def __init__(self, lang_code: str = None):
        self.lang_code = lang_code
        # Define overrides for common lemmatization errors
        self.lemma_overrides = {
            'it': {
                'sto': 'stare',
                'stai': 'stare',
                'sta': 'stare',
                'stiamo': 'stare',
                'state': 'stare',
                'stanno': 'stare',
            }
        }

    def process(self, doc: Any) -> List[TokenNode]:
        nodes = []
        sent_offset = 0
        overrides = self.lemma_overrides.get(self.lang_code, {})
        
        for sent in doc.sentences:
            for word in sent.words:
                if word.upos == "PUNCT":
                    continue
                node = self._convert_stanza_word_to_node(word, sent_offset)
                
                # Apply manual overrides for known issues
                if overrides and node.text.lower() in overrides:
                    node.lemma = overrides[node.text.lower()]
                
                nodes.append(node)
            sent_offset += len(sent.words)
        return nodes

class InflectionStrategy(AnalysisStrategy):
    """
    Strategy for Inflected languages (German, Russian).
    Focus: Case governance, Separable verbs (DE), Aspect (RU).
    """
    def process(self, doc: Any) -> List[TokenNode]:
        nodes = []
        sent_offset = 0
        for sent in doc.sentences:
            for word in sent.words:
                if word.upos == "PUNCT":
                    continue
                node = self._convert_stanza_word_to_node(word, sent_offset)
                # Inflection specific logic
                nodes.append(node)
            sent_offset += len(sent.words)
        return nodes

class AgglutinativeStrategy(AnalysisStrategy):
    """
    Strategy for Agglutinative languages (Turkish).
    Focus: Suffix-chain decomposition.
    """
    def process(self, doc: Any) -> List[TokenNode]:
        nodes = []
        sent_offset = 0
        for sent in doc.sentences:
            for word in sent.words:
                if word.upos == "PUNCT":
                    continue
                node = self._convert_stanza_word_to_node(word, sent_offset)
                
                # Turkish Edge Case: Parse feats into segments
                if node.feats:
                    # Example feats: "Case=Nom|Number=Sing|Person=3"
                    # We can turn this into a list of segments/tags for visualization
                    node.segments = node.feats.split('|')
                
                nodes.append(node)
            sent_offset += len(sent.words)
        return nodes
