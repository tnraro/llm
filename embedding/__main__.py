from db import Db
from embedding import TextEmbeddingModel
from text_embedding import TextEmbedding
from sys import argv

te = TextEmbedding("data.sqlite", "distiluse-base-multilingual-cased-v1")
te.db.version()

# sentences = [
#   "Cargo is Rust’s build system and package manager.",
#   "An integer is a number without a fractional component.", 
#   "An `if` expression allows you to branch your code depending on conditions.",
#   "Ownership is a set of rules that govern how a Rust program manages memory.",
# ]
# te.add(sentences)

q = " ".join(argv[1:])

print("Q:", q)
for a in te.search(q):
  print("A:", a[0])