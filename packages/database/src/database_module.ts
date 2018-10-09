import {
  APP_INITIALIZER,
  Injector,
  ModuleWithProviders,
  NgModule
} from "@angular/core";
import { DatabaseConfig, DATABASE_CONFIG } from "./config";
import { DatabaseInitializer } from "./database_initializer";
import { DatabaseService } from "./database_service";

@NgModule({})
export class DatabaseModule {
  static withConnection(config: DatabaseConfig): ModuleWithProviders {
    return {
      ngModule: DatabaseModule,
      providers: [
        {
          provide: DatabaseInitializer,
          useClass: DatabaseInitializer,
          deps: [Injector]
        },
        { provide: DATABASE_CONFIG, useValue: config },
        {
          provide: DatabaseService,
          useFactory: getDatabase,
          deps: [DatabaseInitializer]
        },
        {
          provide: APP_INITIALIZER,
          multi: true,
          useFactory: getDatabaseInitializer,
          deps: [DatabaseInitializer]
        }
      ]
    };
  }
}
export function getDatabaseInitializer(d: DatabaseInitializer) {
  return d.databaseInitializer.bind(d);
}

export function getDatabase(d: DatabaseInitializer) {
  return d.getDatabaseInstance();
}
