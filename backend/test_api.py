from fastapi.testclient import TestClient
from app.main import app
from unittest.mock import MagicMock, patch
import pytest

client = TestClient(app)

# Mocking stanza to avoid downloading models during test
@patch('app.services.stanza_manager.stanza.Pipeline')
@patch('app.services.stanza_manager.stanza.download')
def test_analyze_endpoint_italian(mock_download, mock_pipeline):
    # Setup mock response
    mock_doc = MagicMock()
    mock_sent = MagicMock()
    mock_word = MagicMock()
    mock_word.id = 1
    mock_word.text = "Ciao"
    mock_word.lemma = "ciao"
    mock_word.upos = "INTJ"
    mock_word.head = 0
    mock_word.deprel = "root"
    mock_word.feats = None
    mock_word.xpos = None
    mock_word.misc = None
    
    mock_sent.words = [mock_word]
    mock_doc.sentences = [mock_sent]
    
    # Configure pipeline mock to return doc
    mock_instance = MagicMock()
    mock_instance.return_value = mock_doc
    mock_pipeline.return_value = mock_instance

    response = client.post(
        "/api/v1/analyze",
        json={"text": "Ciao mondo", "language": "it"}
    )
    
    assert response.status_code == 200
    data = response.json()
    assert data["metadata"]["language"] == "it"
    assert len(data["nodes"]) == 1
    assert data["nodes"][0]["text"] == "Ciao"

@patch('app.services.stanza_manager.stanza.Pipeline')
@patch('app.services.stanza_manager.stanza.download')
def test_analyze_endpoint_turkish(mock_download, mock_pipeline):
    # Setup mock response for Turkish
    mock_doc = MagicMock()
    mock_sent = MagicMock()
    mock_word = MagicMock()
    mock_word.id = 1
    mock_word.text = "Geliyorum"
    mock_word.lemma = "gel"
    mock_word.upos = "VERB"
    mock_word.head = 0
    mock_word.deprel = "root"
    mock_word.feats = "Case=Nom|Number=Sing" # Example feats
    
    mock_sent.words = [mock_word]
    mock_doc.sentences = [mock_sent]
    
    # Configure pipeline mock
    mock_instance = MagicMock()
    mock_instance.return_value = mock_doc
    mock_pipeline.return_value = mock_instance

    response = client.post(
        "/api/v1/analyze",
        json={"text": "Geliyorum", "language": "tr"}
    )
    
    assert response.status_code == 200
    data = response.json()
    assert data["metadata"]["language"] == "tr"
    # Check if segments were populated from feats
    assert data["nodes"][0]["segments"] == ["Case=Nom", "Number=Sing"]

if __name__ == "__main__":
    # If run directly, we can't easily run pytest without installing it, 
    # but we can print a message.
    print("Run this file with pytest: pytest backend/test_api.py")



