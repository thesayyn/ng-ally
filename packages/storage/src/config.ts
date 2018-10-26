import { InjectionToken } from "@angular/core";

export const STORAGE_CONFIG = new InjectionToken<StorageConfig>(
  "STORAGE_CONFIG"
);

export interface StorageConfig {
  default: string;
  partitions: Partitions;
}

export interface Partitions {
  [partitionKey: string]: Partition;
}

export interface Partition {
  host: string;
  [key: string]: any;
}

export const STORAGE_PARTITIONS = new InjectionToken<Partitions>(
  "STORAGE_PARTITIONS"
);

export const STORAGE_PARTITION = new InjectionToken<Partition>(
  "STORAGE_PARTITION"
);

export interface StorageHostsWithKey {
  [key: string]: any;
}

export const STORAGE_HOSTS = new InjectionToken<StorageHostsWithKey>(
  "STORAGE_HOST"
);



