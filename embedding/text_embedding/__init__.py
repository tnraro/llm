from typing import List
from db import Db
from embedding import TextEmbeddingModel

class TextEmbedding:
  def __init__(self, database_name: str, model_name: str):
    self.db = Db(database_name)
    self.model = TextEmbeddingModel(model_name)
  def add(self, texts: List[str]):
    embeddings = self.model.encode(texts)
    self.db.insert(list(zip(texts, embeddings)))
  def search(self, query):
    embedding = self.model.encode(query)
    return self.db.select(embedding)