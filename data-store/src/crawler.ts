import puppeteer, { type Browser, type Page } from "puppeteer";
import { md } from "./md";
import { measure } from "./measure";

export const open = async (browser: Browser, url: string) => {
	const page = await browser.newPage();
	await page.goto(url);
	return page;
};

export const parseContent = async (page: Page) => {
	const main =
		(await page.$("main article")) ??
		(await page.$(".content")) ??
		(await page.$("#content")) ??
		(await page.$("article")) ??
		(await page.$("main")) ??
		(await page.$("#root")) ??
		(await page.$("body"));

	if (main == null) {
		throw new Error("Failed to parse content");
	}
	const text = await main.evaluate((e) => e.innerHTML);
	if (text == null) {
		throw new Error("Failed to parse content");
	}
	const content = md(text);
	return content;
};

export const parseTitle = async (page: Page) => {
	const title =
		page.$eval("title", (e) => e.textContent?.trim() as string) ?? "";
	return title;
};
export const parseLinks = async (page: Page, origin: string) => {
	const links = new Set(
		(
			await Promise.all(
				(await page.$$("a")).map((e) => e.evaluate((e) => e.href)),
			)
		)
			.map((link) => {
				const url = new URL(link, origin);
				const l = url.origin + url.pathname;
				return l;
			})
			.filter((link) => {
				return link.length > 0 && new URL(link, origin).origin === origin;
			}),
	);
	return links;
};

export async function* run(url: string, options?: { depth?: number }) {
	const opt = {
		depth: 2,
		...options,
	}
	const browser = await puppeteer.launch({ headless: "new" });

	const queue = [{ url, depth: 1 }];
	const visitedLinks = new Set<string>([url]);
	let i = 100_000;
	while (queue.length > 0 && i-- > 0) {
		try {
			const node = queue.pop();
			if (node == null) break;
			const u = new URL(node.url);
			const page = await open(browser, node.url);
			using t0 = measure("parse title");
			const title = await parseTitle(page);
			t0();
			using t1 = measure("parse content");
			const content = await parseContent(page);
			if (content.length === 0) {
				await page.close();
				continue;
			}
			t1();
			if (node.depth < opt.depth) {
				using t2 = measure("parse links");
				const relatedLinks = await parseLinks(page, u.origin);
				t2();
				for (const link of relatedLinks) {
					if (visitedLinks.has(link)) continue;
					visitedLinks.add(link);
					queue.push({ url: link, depth: node.depth + 1 });
				}
			}
			await page.close()

			yield {
				url: node.url,
				title,
				content,
			};

		} catch (error) {
			console.error(error);
		}
	}

	await browser.close();
}
