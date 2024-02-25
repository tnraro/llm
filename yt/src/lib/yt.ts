export const parseId = (link: string) => {
  return link.match(/(?<=:\/\/youtu\.be\/|\/watch\?v=|&v=|shorts\/)[-_\w]{11}/)?.[0];
}
