import { NodeHtmlMarkdown } from "node-html-markdown"

export const md = (html: string) => {
	const rewritter = new HTMLRewriter();
	rewritter.on(
		`[hidden],nav,aside,header,footer,script,head,template,button,area,base,col,command,embed,input,keygen,link,meta,param,source,style,track,wbr,img,svg,video,br,
    .mw-editsection,.noprint`,
		{
			element(element) {
				element.remove();
			},
      text(text) {
        text.remove();
      }
		},
	);
  rewritter.on("a", {
    element(element) {
      if (element.removed) return
      element.removeAttribute("href");
    }
  })
	const rewrittenHtml = rewritter.transform(html);
  return NodeHtmlMarkdown.translate(rewrittenHtml, {
    bulletMarker: "-",
    strikeDelimiter: "",
    strongDelimiter: "",
    emDelimiter: "",
  });
};