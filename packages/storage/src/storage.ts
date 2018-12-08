import { Injector } from "@angular/core";
import { Partition, StorageConfig, STORAGE_PARTITION } from "./config";
import { FileBuffer, Host, Stats } from "./host";
import { Path, PathFragment, URL } from "./path";

export class Storage {

  constructor(
    private injector: Injector,
    private config: StorageConfig,
    private hostMap: Map<string, any>
  ) {}

  write(path: Path, content: ArrayBuffer, storage?: string): Promise<void> {
    const partition = this._getPartition(storage);
    const host = this._getHost(partition);
    return host.write(path, content);
  }

  url(path: Path, storage?: string): Promise<URL> {
    const partition = this._getPartition(storage);
    const host = this._getHost(partition);
    return host.url(path);
  }


  list(path: Path, storage?: string): Promise<PathFragment[]> {
    const partition = this._getPartition(storage);
    const host = this._getHost(partition);
    return host.list(path);
  }

  read(path: Path, storage?: string): Promise<FileBuffer> {
    const partition = this._getPartition(storage);
    const host = this._getHost(partition);
    return host.read(path as Path);
  }

  rename(from: Path, to: Path, storage?: string): Promise<void> {
    const partition = this._getPartition(storage);
    const host = this._getHost(partition);
    return host.rename(from, to);
  }

  delete(path: Path, storage?: string): Promise<void> {
    const partition = this._getPartition(storage);
    const host = this._getHost(partition);
    return host.delete(path);
  }

  exists(path: Path, storage?: string): Promise<boolean> {
    const partition = this._getPartition(storage);
    const host = this._getHost(partition);
    return host.exists(path);
  }

  isDirectory(path: Path, storage?: string): Promise<boolean> {
    const partition = this._getPartition(storage);
    const host = this._getHost(partition);
    return host.isDirectory(path);
  }

  isFile(path: Path, storage?: string): Promise<boolean> {
    const defaultHost = this._getPartition(storage);
    const host = this._getHost(defaultHost);
    return host.isFile(path);
  }

  stat(path: Path, storage?: string): Promise<Stats> {
    const partition = this._getPartition(storage);
    const host = this._getHost(partition);
    return host.stat(path);
  }

  /**
   * Returns the host key of storage.
   * If the key param is undefined it will return the default storage key
   * @param key Key of the storage part
   */
  private _getPartition(key?: string | undefined): Partition {
    key = key || this.config.default;
    return this.config.partitions[key];
  }

  /**
   * Returns the instance of host
   * @param key Key of the host
   */
  private _getHost<T = Host>(partition: Partition): T {
    const hostToken = this.hostMap.get(partition.host);
    const injector = Injector.create(
      [{ provide: STORAGE_PARTITION, useValue: partition }],
      this.injector
    );
    return injector.get<T>(hostToken);
  }
}
