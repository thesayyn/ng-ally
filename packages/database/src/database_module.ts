import { NgModule, ModuleWithProviders, APP_INITIALIZER, Injector, InjectionToken, APP_BOOTSTRAP_LISTENER } from '@angular/core'
import { MongoClient, Db } from 'mongodb'
import { DatabaseConfig, DATABASE_CONFIG } from './config';
import { DatabaseService } from './database_service';
import { DatabaseInitializer } from './database_initializer';


@NgModule({})
export class DatabaseModule{
    static withConnection(config: DatabaseConfig): ModuleWithProviders
    {
        return {
            ngModule: DatabaseModule,
            providers: [
                DatabaseInitializer,
                { provide: DATABASE_CONFIG, useValue: config },
                { provide: DatabaseService, useFactory: getDatabase, deps: [ DatabaseInitializer ] },
                { provide: APP_INITIALIZER, multi: true, useFactory: getDatabaseInitializer,  deps: [ DatabaseInitializer ] },
            ]
        }
    }
}
export function getDatabaseInitializer(d: DatabaseInitializer) {
    return d.databaseInitializer.bind(d);
}

export function getDatabase(d: DatabaseInitializer) {
    return d.getDatabaseInstance()
}



