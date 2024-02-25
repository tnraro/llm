import { Database } from "bun:sqlite";

export const createDatabase = (filename?: string) => {
  const db = new Database(filename) as  Database & { [Symbol.dispose]: () => void };
  db.exec("PRAGMA journal_mode=WAL;");
  db[Symbol.dispose] = db.close;
  return db;
}