import { Host, Stats, FileBuffer } from "./host";
import * as fs from "fs";
import { Path, PathFragment, URL } from "./path";

type FsFunction0<R> = (cb: (err?: Error, result?: R) => void) => void;
type FsFunction1<R, T1> = (
  p1: T1,
  cb: (err?: Error, result?: R) => void
) => void;
type FsFunction2<R, T1, T2> = (
  p1: T1,
  p2: T2,
  cb: (err?: Error, result?: R) => void
) => void;

function _callFs<R>(fn: FsFunction0<R>): Promise<R>;
function _callFs<R, T1>(fn: FsFunction1<R, T1>, p1: T1): Promise<R>;
function _callFs<R, T1, T2>(
  fn: FsFunction2<R, T1, T2>,
  p1: T1,
  p2: T2
): Promise<R>;

function _callFs<ResultT>(fn: Function, ...args: {}[]): Promise<ResultT> {
  return new Promise((resolve, reject) => {
    fn(...args, (err?: Error, result?: ResultT) => {
      if (err) {
        reject(err);
      } else {
        resolve(result);
      }
    });
  });
}

export class NodeHost implements Host {
  write(path: Path, content: FileBuffer): Promise<void> {
    return _callFs<void, string, Uint8Array>(
      fs.writeFile,
      path,
      new Uint8Array(content)
    );
  }
  delete(path: Path): Promise<void> {
    return _callFs(fs.unlink, path);
  }
  rename(from: Path, to: Path): Promise<void> {
    return _callFs(fs.rename, from, to);
  }
  read(path: Path): Promise<FileBuffer> {
    return _callFs(fs.readFile, path).then(
      buffer => new Uint8Array(buffer).buffer
    );
  }
  list(path: Path): Promise<PathFragment[]> {
    return _callFs(fs.readdir, path) as any as Promise<PathFragment[]>;
  }
  exists(path: Path): Promise<boolean> {
    return new Promise(resolve => {
      fs.exists(path, exists => resolve(exists));
    });
  }
  isDirectory(path: Path): Promise<boolean> {
    return _callFs(fs.stat, path).then((stat: any) => stat.isDirectory());
  }
  isFile(path: Path): Promise<boolean> {
    return _callFs(fs.stat, path).then((stat: any) => stat.isFile());
  }
  stat(path: Path): Promise<Stats> {
    return _callFs(fs.stat, path);
  }
  url(): Promise<URL> {
    throw new Error("Url method not supported on local.");
  }
}
