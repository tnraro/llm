import { argv } from "bun";
import { Pipeline } from "./pipe";

const cli = async (command: string, ...options: string[]) => {
  switch (command) {
    case "s":
    case "summarize": {
      const [link] = options;
      const pipeline = new Pipeline(link);
      await pipeline.pipe("download-subtitle");
      await pipeline.pipe("split-to-chunks");
      await pipeline.pipe("map-reduce", true);
      console.log(pipeline.content);
      await pipeline.pipe("improve-readability", true);
      console.log(pipeline.content);
      await pipeline.pipe("translate-to-korean");
      return pipeline.content;
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