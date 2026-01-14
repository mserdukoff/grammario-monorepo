from typing import List, Any, Dict, Optional
from app.services.strategies.base import AnalysisStrategy
from app.models.schemas import TokenNode
import re


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
                nodes.append(node)
            sent_offset += len(sent.words)
        return nodes


class AgglutinativeStrategy(AnalysisStrategy):
    """
    Strategy for Agglutinative languages (Turkish).
    Focus: Suffix-chain decomposition with morpheme segmentation.
    """
    
    def __init__(self):
        # Common Turkish suffix patterns for segmentation
        # These are simplified - a full implementation would use a morphological analyzer
        
        # Case suffixes (with vowel harmony variants)
        self.case_suffixes = {
            'dative': ['a', 'e', 'ya', 'ye', 'na', 'ne'],  # to
            'locative': ['da', 'de', 'ta', 'te'],  # at/in
            'ablative': ['dan', 'den', 'tan', 'ten'],  # from
            'accusative': ['ı', 'i', 'u', 'ü', 'yı', 'yi', 'yu', 'yü', 'nı', 'ni', 'nu', 'nü'],
            'genitive': ['ın', 'in', 'un', 'ün', 'nın', 'nin', 'nun', 'nün'],
        }
        
        # Possessive suffixes
        self.possessive_suffixes = {
            '1sg': ['ım', 'im', 'um', 'üm', 'm'],  # my
            '2sg': ['ın', 'in', 'un', 'ün', 'n'],  # your
            '3sg': ['ı', 'i', 'u', 'ü', 'sı', 'si', 'su', 'sü'],  # his/her/its
            '1pl': ['ımız', 'imiz', 'umuz', 'ümüz', 'mız', 'miz', 'muz', 'müz'],  # our
            '2pl': ['ınız', 'iniz', 'unuz', 'ünüz', 'nız', 'niz', 'nuz', 'nüz'],  # your (pl)
            '3pl': ['ları', 'leri'],  # their
        }
        
        # Verb tense/aspect suffixes
        self.verb_suffixes = {
            'present_cont': ['ıyor', 'iyor', 'uyor', 'üyor'],
            'aorist': ['ır', 'ir', 'ur', 'ür', 'ar', 'er', 'r'],
            'past': ['dı', 'di', 'du', 'dü', 'tı', 'ti', 'tu', 'tü'],
            'future': ['acak', 'ecek'],
            'conditional': ['sa', 'se'],
            'necessity': ['malı', 'meli'],
        }
        
        # Person suffixes for verbs
        self.person_suffixes = {
            '1sg': ['ım', 'im', 'um', 'üm', 'm'],
            '2sg': ['sın', 'sin', 'sun', 'sün', 'n'],
            '3sg': [],  # often zero
            '1pl': ['ız', 'iz', 'uz', 'üz', 'k'],
            '2pl': ['sınız', 'siniz', 'sunuz', 'sünüz', 'nız', 'niz'],
            '3pl': ['lar', 'ler'],
        }

    def segment_turkish_word(self, word: str, lemma: str, feats: Optional[str]) -> List[str]:
        """
        Attempt to segment a Turkish word into morphemes.
        Returns a list of morpheme descriptions.
        """
        if not word or not lemma:
            return []
            
        word_lower = word.lower()
        lemma_lower = lemma.lower()
        
        # If word equals lemma, no suffixes
        if word_lower == lemma_lower:
            return [f"{lemma} (stem)"]
        
        # Try to identify the stem and suffixes
        segments = []
        
        # Start with the lemma as stem
        if word_lower.startswith(lemma_lower):
            segments.append(f"{lemma} (stem)")
            remaining = word_lower[len(lemma_lower):]
        else:
            # Handle stem changes (consonant softening, vowel drops)
            # Try to find where stem ends
            stem = self._find_stem(word_lower, lemma_lower)
            if stem:
                segments.append(f"{stem} (stem from {lemma})")
                remaining = word_lower[len(stem):]
            else:
                segments.append(f"{lemma} (stem)")
                remaining = word_lower[len(lemma_lower):] if len(word_lower) > len(lemma_lower) else ""
        
        # Parse features to guide segmentation
        feat_dict = {}
        if feats:
            for feat in feats.split('|'):
                if '=' in feat:
                    key, val = feat.split('=', 1)
                    feat_dict[key] = val
        
        # Identify suffixes based on features and remaining string
        if remaining:
            suffix_descriptions = self._identify_suffixes(remaining, feat_dict)
            segments.extend(suffix_descriptions)
        
        return segments

    def _find_stem(self, word: str, lemma: str) -> Optional[str]:
        """Find the actual stem in a word, accounting for Turkish phonological changes."""
        # Consonant softening: k->ğ, p->b, t->d, ç->c
        softening = {'k': 'ğ', 'p': 'b', 't': 'd', 'ç': 'c'}
        
        # Try direct match first
        for i in range(len(lemma), 0, -1):
            if word.startswith(lemma[:i]):
                return lemma[:i]
        
        # Try with consonant softening
        if lemma and lemma[-1] in softening:
            modified_lemma = lemma[:-1] + softening[lemma[-1]]
            for i in range(len(modified_lemma), 0, -1):
                if word.startswith(modified_lemma[:i]):
                    return modified_lemma[:i]
        
        return None

    def _identify_suffixes(self, suffix_str: str, feats: Dict[str, str]) -> List[str]:
        """Identify and describe Turkish suffixes."""
        descriptions = []
        remaining = suffix_str
        
        # Check for possessive
        if feats.get('Person[psor]') or 'Number[psor]' in feats:
            poss_person = feats.get('Person[psor]', '')
            for pattern in ['sı', 'si', 'su', 'sü', 'ı', 'i', 'u', 'ü']:
                if remaining.startswith(pattern):
                    descriptions.append(f"-{pattern} (possessive)")
                    remaining = remaining[len(pattern):]
                    break
        
        # Check for buffer consonant 'n' before case suffix
        if remaining.startswith('n') and len(remaining) > 1:
            descriptions.append("-n (buffer)")
            remaining = remaining[1:]
        
        # Check for case
        case = feats.get('Case', '')
        if case == 'Dat':
            for pattern in ['a', 'e', 'ya', 'ye']:
                if remaining.startswith(pattern):
                    descriptions.append(f"-{pattern} (dative: to)")
                    remaining = remaining[len(pattern):]
                    break
        elif case == 'Loc':
            for pattern in ['da', 'de', 'ta', 'te']:
                if remaining.startswith(pattern):
                    descriptions.append(f"-{pattern} (locative: at/in)")
                    remaining = remaining[len(pattern):]
                    break
        elif case == 'Abl':
            for pattern in ['dan', 'den', 'tan', 'ten']:
                if remaining.startswith(pattern):
                    descriptions.append(f"-{pattern} (ablative: from)")
                    remaining = remaining[len(pattern):]
                    break
        elif case == 'Acc':
            for pattern in ['ı', 'i', 'u', 'ü', 'yı', 'yi', 'yu', 'yü']:
                if remaining.startswith(pattern):
                    descriptions.append(f"-{pattern} (accusative: direct object)")
                    remaining = remaining[len(pattern):]
                    break
        elif case == 'Gen':
            for pattern in ['ın', 'in', 'un', 'ün', 'nın', 'nin']:
                if remaining.startswith(pattern):
                    descriptions.append(f"-{pattern} (genitive: of)")
                    remaining = remaining[len(pattern):]
                    break
        elif case == 'Ins':
            for pattern in ['la', 'le', 'yla', 'yle']:
                if remaining.startswith(pattern):
                    descriptions.append(f"-{pattern} (instrumental: with)")
                    remaining = remaining[len(pattern):]
                    break
        
        # Check for verb tense
        aspect = feats.get('Aspect', '')
        tense = feats.get('Tense', '')
        
        if aspect == 'Prog' or 'iyor' in remaining or 'uyor' in remaining:
            for pattern in ['ıyor', 'iyor', 'uyor', 'üyor']:
                if pattern in remaining:
                    idx = remaining.find(pattern)
                    if idx >= 0:
                        descriptions.append(f"-{pattern} (present continuous)")
                        remaining = remaining[idx + len(pattern):]
                        break
        
        if tense == 'Past':
            for pattern in ['dı', 'di', 'du', 'dü', 'tı', 'ti', 'tu', 'tü']:
                if pattern in remaining:
                    idx = remaining.find(pattern)
                    if idx >= 0:
                        descriptions.append(f"-{pattern} (past tense)")
                        remaining = remaining[idx + len(pattern):]
                        break
        
        # Check for person/number
        person = feats.get('Person', '')
        number = feats.get('Number', '')
        
        if remaining:
            if person == '1' and number == 'Sing':
                for p in ['um', 'üm', 'ım', 'im', 'm']:
                    if remaining.endswith(p):
                        descriptions.append(f"-{p} (1st person singular: I)")
                        break
            elif person == '2' and number == 'Sing':
                for p in ['sun', 'sün', 'sın', 'sin', 'n']:
                    if remaining.endswith(p):
                        descriptions.append(f"-{p} (2nd person singular: you)")
                        break
            elif person == '3' and number == 'Plur':
                for p in ['lar', 'ler']:
                    if remaining.endswith(p):
                        descriptions.append(f"-{p} (3rd person plural: they)")
                        break
        
        # If we still have unidentified content
        if remaining and not descriptions:
            descriptions.append(f"-{remaining} (suffix)")
        
        return descriptions

    def process(self, doc: Any) -> List[TokenNode]:
        nodes = []
        sent_offset = 0
        
        for sent in doc.sentences:
            for word in sent.words:
                if word.upos == "PUNCT":
                    continue
                    
                node = self._convert_stanza_word_to_node(word, sent_offset)
                
                # Perform Turkish morpheme segmentation
                segments = self.segment_turkish_word(
                    node.text,
                    node.lemma,
                    node.feats
                )
                
                if segments:
                    node.segments = segments
                elif node.feats:
                    # Fallback to feature display
                    node.segments = node.feats.split('|')
                
                nodes.append(node)
            sent_offset += len(sent.words)
            
        return nodes
