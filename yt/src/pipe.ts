class Pipe<Context> {
  context: Context;
  fns: ((context: any) => any)[] = []
  constructor(context: Context) {
    this.context = context;
  }
  use<R>(fn: (context: Context) => R): Pipe<Awaited<R>> {
    this.fns.push(fn);
    return this as unknown as Pipe<Awaited<R>>
  }
  async run() {
    for (const fn of this.fns) {
      try {
        this.context = await fn(this.context);
      } catch (error) {
        console.error("pipe error:", error);
        break;
      }
    }
    return this.context;
  }
}

export const createContext = () => {
  return new Pipe({ context: "" });
}