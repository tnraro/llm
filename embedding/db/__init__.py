import sqlite3
import sqlite_vss
from numpy.typing import NDArray
from numpy import float32
from typing import List

class Db:
  def __init__(self, database = ":memory:"):
    self.conn = sqlite3.connect(database, isolation_level=None)
    self.conn.enable_load_extension(True)
    sqlite_vss.load(self.conn)
    self.conn.enable_load_extension(False)
    cursor = self.conn.cursor()
    cursor.execute("pragma journal_mode=wal;")

    cursor.execute("create virtual table if not exists vss_sentence using vss0(embedding(512));")
    cursor.execute("""create table if not exists sentence (
  content TEXT
);
""")
    self.conn.commit()

  def insert(self, data: List[tuple[str, NDArray[float32]]]):
    cursor = self.conn.cursor()
    try:
      for row in data:
        cursor.execute("insert into sentence (content) values (?);", (row[0],))
        cursor.execute("insert into vss_sentence(rowid, embedding) values (last_insert_rowid(), ?);", (row[1],))
      self.conn.commit()
    except self.conn.Error as err:
      print("Error::", err)
      self.conn.rollback()

  def select_all(self):
    # return self.conn.execute("select rowid from vss_sentence;").fetchall()
    return self.conn.execute("select content from sentence join vss_sentence on sentence.rowid=vss_sentence.rowid;").fetchall()
  def select(self, query: NDArray[float32], limit: int | None = 1):
    return self.conn.execute("""
      select * from sentence
      where rowid in (
        select rowid from vss_sentence
        where vss_search(embedding, ?)
        limit 3
      );""", (query,)).fetchmany(limit);
  def version(self):
    version, = self.conn.execute("select vss_version()").fetchone()
    print("vss version:", version)
  