import { bench, run } from "mitata";
import { createTextEmbedding } from "./embedding";

{
  using embedding = await createTextEmbedding();
  bench("embedding", async () => {
    await embedding.get("부탁드려요");
  });
}

await run();
