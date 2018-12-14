import { Injectable, Injector, isDevMode } from '@angular/core';
import { Db, MongoClient } from 'mongodb';
import { DATABASE_CONFIG, DATABASE_BOOTSTRAP_LISTENER, DATABASE_FAILURE_LISTENER } from './config';

@Injectable()
export class DatabaseInitializer {
  private instance: Db;

  constructor(private injector: Injector) {}

  async databaseInitializer(): Promise<any> {
    const config = this.injector.get(DATABASE_CONFIG);

    let uri = `${config.protocol || 'mongodb'}://`;
    if ('username' in config && 'password' in config) {
      uri += `${config.username!}:${config.password!}@`;
    }
    if (config.port) {
      uri += `${config.host!}:${config.port!}/${config.database!}`;
    } else {
      uri += `${config.host!}/${config.database!}`;
    }

    uri += config.additionalQueryString;

    return await MongoClient.connect(uri)
      .then(client => client.db(config.database)!)
      .then(db => (this.instance = db))
      .then(() => {
        const bootstrapListeners = this.injector.get(DATABASE_BOOTSTRAP_LISTENER, []);
        bootstrapListeners.filter(l => typeof l === 'function').forEach(l => l());
      })
      .catch(error => {
        const failListeners = this.injector.get(DATABASE_FAILURE_LISTENER, []);
        failListeners.filter(l => typeof l === 'function').forEach(l => l(error));
        if (isDevMode()) {
          console.info(`URI: ${uri}`);
          console.error(error);
        }
      });
  }

  getDatabaseInstance(): Db {
    return this.instance;
  }
}
