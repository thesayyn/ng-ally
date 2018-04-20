import { NgModule, ModuleWithProviders, APP_INITIALIZER, Injector, InjectionToken, APP_BOOTSTRAP_LISTENER } from '@angular/core'
import { MongoClient, Db } from 'mongodb'
import { DatabaseConfig, DATABASE_CONFIG, DATABASE, DATABASE_INITIALIZER } from './config';
import { DatabaseService } from './database_service';
import { DatabaseInitializer } from './database_initializer';


@NgModule({
    providers:[
        { provide: DatabaseService, useClass: DatabaseService, deps: [DATABASE] }
    ]
})
export class DatabaseModule{
    static withConnection(config: DatabaseConfig): ModuleWithProviders
    {
        return {
            ngModule: DatabaseModule,
            providers: [
                DatabaseInitializer,
                {provide: DATABASE_CONFIG, useValue: config},
                {provide: DATABASE, useFactory: getDatabase, deps:[ DATABASE_CONFIG ]},
                {provide: DATABASE_INITIALIZER, useFactory: getBootstrapListener, deps: [DatabaseInitializer] },
                {provide: APP_BOOTSTRAP_LISTENER, multi: true, useExisting: DATABASE_INITIALIZER}
            ]
        }
    }
}

export function getBootstrapListener(d: DatabaseInitializer) {
    return d.bootstrapListener.bind(d);
}



/**
 * @noDocsRequired
 * @experimental
 */
export async function getDatabase(config: DatabaseConfig): Promise<Db>
{
    let uri = 'mongodb://';
    if('username' in config && 'password' in config)
    {
        uri+= `${config.username!}:${config.password!}`;
    }
    config.port = config.port || 27017;
    uri+= `${config.host!}:${config.port!}/${config.database!}`;


	return MongoClient.connect(uri).then(client => {
		return client.db(config.database)!;
	});
}


