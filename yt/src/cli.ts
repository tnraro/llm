import { argv } from "bun";
import { createPipe } from "./pipe";
import { dlyt } from "./pipe/yt";
import { sp2ck } from "./pipe/sp2ck";
import { summarize } from "./pipe/summarize";
import { print } from "./pipe/print";
import { asr } from "./pipe/answer";
import { dlts } from "./pipe/ts";

const cli = async (command: string, ...options: string[]) => {
  switch (command) {
    case "s":
    case "summarize": {
      const [link] = options;
      createPipe({ content: "" } as { content: string | string[] })
        .pipe(
          dlyt(link),
          sp2ck(1024),
          print,
          summarize,
          print,
        )
      return;
    }
    case "q":
    case "question": {
      const [link, question] = options;
      createPipe({ content: "" } as { content: string | string[] })
        .pipe(
          dlyt(link),
          sp2ck(1024),
          summarize,
          asr(question),
          print,
        )
      return;
    }
    case "ts": {
      const [link] = options;
      createPipe({ content: "" } as { content: string | string[] })
        .pipe(
          dlts(link),
          // sp2ck(1024),
          // summarize,
          print,
        )
      return;
    }
    default: {
      return `
usage: yt [command] [options]

  s YT, summarize YT    summarize YT link

  h, help               show this help message
`
    }
  }
}


let [command, ...options] = argv.slice(2);
if (command == null) {
  command = "help";
}
console.log(await cli(command, ...options));