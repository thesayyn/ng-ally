import {
  Inject,
  Injector,
  ModuleWithProviders,
  NgModule,
  Optional
} from "@angular/core";
import {
  Partitions,
  StorageConfig,
  StorageHostsWithKey,
  STORAGE_CONFIG,
  STORAGE_HOSTS,
  STORAGE_PARTITIONS
} from "./config";
import { NodeHost } from "./node_host";
import { Storage } from "./storage";

@NgModule({})
export class StorageModule {
  static forRoot(config: StorageConfig): ModuleWithProviders {
    return {
      ngModule: StorageModule,
      providers: [
        {
          provide: NodeHost,
          useClass: NodeHost,
          deps: []
        },
        {
          provide: STORAGE_HOSTS,
          multi: true,
          useValue: { local: NodeHost }
        },
        {
          provide: STORAGE_CONFIG,
          useValue: config
        },
        {
          provide: Storage,
          useFactory: provideStorage,
          deps: [
            Injector,
            [new Inject(STORAGE_CONFIG), new Optional()],
            [new Inject(STORAGE_HOSTS), new Optional()],
            [new Inject(STORAGE_PARTITIONS), new Optional()]
          ]
        }
      ]
    };
  }
  static forChild(partitions: Partitions): ModuleWithProviders {
    return {
      ngModule: StorageModule,
      providers: [
        {
          provide: STORAGE_PARTITIONS,
          useValue: partitions
        }
      ]
    };
  }
}

export function provideStorage(
  injector: Injector,
  config: StorageConfig,
  hosts: StorageHostsWithKey[],
  partitions: Partitions[]
): Storage {
  const hostMap = [].concat(hosts).reduce<Map<string, any>>((map, hostPair) => {
    for (const key in hostPair) {
      const host = hostPair[key];
      if (host) {
        map.set(key, host);
      }
    }
    return map;
  }, new Map<string, any>());
  [].concat(partitions).forEach(partitions => {
    config.partitions = { ...config.partitions, ...partitions };
  });
  return new Storage(injector, config, hostMap);
}
