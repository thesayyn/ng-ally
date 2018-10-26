export type URL = string & {
  URL: void;
};
export type Path = string & {
  PATH: void;
};
export type PathFragment = Path & {
  PATH_FRAGMENT: void;
};
export function normalize(path: string): Path {
  return path as Path;
}
