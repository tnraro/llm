export const exec = <C>(callback: (context: C) => void | Promise<void>) => async (context: C): Promise<C> => {
  await callback(context);
  return context;
}