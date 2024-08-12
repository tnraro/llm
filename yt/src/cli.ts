import { argv } from "bun";
import { createContext } from "./pipe";
import { dlyt } from "./pipe/yt";
import { sp2ck } from "./pipe/sp2ck";
import { summarize } from "./pipe/summarize";
import { print } from "./pipe/print";
import { asr } from "./pipe/answer";
import { dlts } from "./pipe/ts";
import { mr } from "./pipe/map-reduce";
import { infer } from "./pipe/infer";
import { exec } from "./pipe/exec";
import { concat } from "./pipe/concat";

const cli = async (command: string, ...options: string[]) => {
  switch (command) {
    case "s":
    case "summarize": {
      const [link] = options;
      createContext()
        .use(dlyt(link))
        .use(sp2ck(1024))
        .use(summarize)
        .use(concat())
        .use(print)
        .run();
      return;
    }
    case "q":
    case "question": {
      const [link, question] = options;
      createContext()
        .use(dlyt(link))
        .use(sp2ck(1024))
        .use(summarize)
        .use(asr(question))
        .use(concat())
        .use(print)
        .run();
      return;
    }
    case "ts": {
      const [link] = options;
      createContext()
        .use(dlts(link))
        .use(sp2ck(2048))
        .use(mr)
        .use(print)
        .use(exec(() => { console.log() }))
        .use(infer(`Summarize it in one sentence.`))
        .use(print)
        .run()
      return;
    }
    case "tsq": {
      const [link, question] = options;
      createContext()
        .use(dlts(link))
        .use(sp2ck(2048))
        .use(infer(question))
        .use(concat())
        .use(print)
        .use(infer(question))
        .use(print)
        .run()
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