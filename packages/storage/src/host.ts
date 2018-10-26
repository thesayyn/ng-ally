import { Path, PathFragment, URL } from "./path";

export type FileBuffer = ArrayBuffer;
export type FileBufferLike = ArrayBufferLike;

export type Stats<T extends object = {}> = T & {
  readonly size: number;

  readonly atime: Date;
  readonly mtime: Date;
  readonly ctime: Date;
  readonly birthtime: Date;
};

export interface ReadonlyHost<StatsT extends object = {}> {
  read(path: Path): Promise<FileBuffer>;

  list(path: Path): Promise<PathFragment[]>;

  exists(path: Path): Promise<boolean>;
  isDirectory(path: Path): Promise<boolean>;
  isFile(path: Path): Promise<boolean>;
  url(): Promise<URL | null>;
  // Some hosts may not support stats.
  stat(path: Path): Promise<Stats<StatsT> | null> | null;
}

export interface Host<StatsT extends object = {}> extends ReadonlyHost<StatsT> {
  write(path: Path, content: FileBufferLike): Promise<void>;
  delete(path: Path): Promise<void>;
  rename(from: Path, to: Path): Promise<void>;
}
