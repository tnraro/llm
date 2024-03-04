export const createPipe = <Context>(context: Context) => {
  type Pipe = (context: Context) => Promise<Partial<Context>> | Partial<Context> | void;
  const pipe = async (...ps: Pipe[]) => {
    for (const p of ps) {
      try {
        context = {
          ...context,
          ...await p(context),
        }
      } catch (error) {
        console.error("pipe error:", error);
        break;
      }
    }
  }
  return {
    context,
    pipe,
  }
}