from typing import List
from sentence_transformers import SentenceTransformer
import warnings
warnings.filterwarnings('ignore', category=UserWarning, message='TypedStorage is deprecated')

class TextEmbeddingModel:
  def __init__(self, name):
    self.model = SentenceTransformer(name)
  def encode(self, sentences: str | List[str]):
    return self.model.encode(sentences, convert_to_numpy=True)
