export const unmd = (md: string) => {
  return md.replaceAll(/(?<=^\s*)(?:[-*]|\d+\.) |\*\*(\S.*)\*\*|__(\S.*)__|\*(\S.*)\*|_(\S.*)_|^#{1,6} |`(\S.*)`/gm, "$1$2$3$4$5")
}