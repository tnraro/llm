import { $, argv, env, write } from "bun";
import { JSDOM } from "jsdom";
import { NodeHtmlMarkdown } from "node-html-markdown";
import puppeteer, { Browser } from "puppeteer";

const query = argv.slice(2).join(" ")

interface PromiseFulfilledResult<T> {
  status: "fulfilled";
  value: T;
}

interface PromiseRejectedResult {
  status: "rejected";
  reason: any;
}
const search = async (query: string) => {
  const url = new URL("https://www.google.com/search");
  url.searchParams.append("q", query);
  const res = await fetch(url, {
    headers: {
      "Accept-Language": "en-US"
    }
  });
  if (!res.ok) {
    throw res;
  }
  const text = await res.text();

  const dom = new JSDOM(text)

  const links = [...dom.window.document.querySelectorAll("a[href]:has(h3)")]
    .filter(x => (x as HTMLAnchorElement).href.startsWith("/url") && x.children.length === 1 && x.children[0].tagName === "DIV")
    .map(x => {
      const a = x as HTMLAnchorElement;
      const url = new URL(a.href, "https://example.com")
      const href = url.searchParams.get("q")
      return href
    })
    .filter(<T>(x: T | null): x is T => x != null)

  return links;
}

const getContent = async (browser: Browser, url: string) => {
  const page = await browser.newPage();
  await page.goto(url);

  const main = await page.$("main > article")
    ?? await page.$("main")
    ?? await page.$(".content")
    ?? await page.$("article")
    ?? await page.$("#root")
    ?? await page.$("body")

  if (main == null) {
    throw new Error("Failed to parse content");
  }
  const text = await main.evaluate(e => e.textContent?.trim())
  if (text == null) {
    throw new Error("Failed to parse content");
  }

  const title = await (await page.$("title"))?.evaluate(e => e.textContent?.trim()) ?? "";

  const content = NodeHtmlMarkdown.translate(text, {
    ignore: ["nav", "aside", "header", "footer", "script", "head", "template"]
  }).slice(0, 10_000)

  return {
    title,
    url,
    content
  };
}
const summarize = async (context: string) => {
  const systemPrompt = env.SYSTEM_PROMPT;
  const userPrompt = env.USER_PROMPT;
  const prompt = `${systemPrompt}
### Context:
${context}
### Instruction:
${userPrompt}
### Response:
`;
  const output = await $`${env.LLAMACPP} -m ${env.MODEL} --ctx-size 10000 --prompt ${prompt} --n-gpu-layers 32`.text();
  const match = output.match(/(?<=\n### Response:\n)[\s\S]+$/);
  if (match == null) {
    console.error(output);
    throw new Error("Failed to summarize");
  }
  const response = match[0];
  return response;
}
const getWebContents = async (links: string[]) => {
  const browser = await puppeteer.launch({ headless: "new" });
  const results = await Promise.allSettled(links.map(link => getContent(browser, link)))
  await browser.close();
  const contents = results.filter(<T>(x: PromiseFulfilledResult<T> | PromiseRejectedResult): x is PromiseFulfilledResult<T> => {
    if (x.status === "rejected") {
      console.error(x.reason);
      return false;
    }
    return true;
  }).map(x => x.value)
  return contents;
}
const summarizeContents = async (contents: {
  title: string;
  url: string;
  content: string;
}[]) => {
  const s: string[] = [];
  let i = 0;
  for (const { title, content, url } of contents) {
    try {
      s.push(`${await summarize(content)}[[${++i}](${url})]`);
    } catch (error) {
      console.error(error);
    }
  }
  const summary = s.join("\n")
  return summary;
}

const links = await search(query);
const top3 = links
  .filter(link => {
    const url = new URL(link);
    if (url.origin.endsWith("twitter.com")) return false;
    if (url.origin.endsWith("velog.io")) return false;

    return true;
  })
  .slice(0, 3);
const contents = await getWebContents(top3);
const result = await summarizeContents(contents);

await write("result.md", `# ${query}\n\n${result}`);