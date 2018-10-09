import { Injectable, Injector } from "@angular/core";
import { Db, MongoClient } from "mongodb";
import {
  DATABASE_CONFIG,
  DATABASE_BOOTSTRAP_LISTENER,
  DATABASE_FAILURE_LISTENER
} from "./config";

@Injectable()
export class DatabaseInitializer {
  private instance: Db;

  constructor(private injector: Injector) {}

  databaseInitializer(): Promise<void> {
    const config = this.injector.get(DATABASE_CONFIG);
    return new Promise((resolve, reject) => {
      7;
      let uri = "mongodb://";
      if ("username" in config && "password" in config) {
        uri += `${config.username!}:${config.password!}`;
      }
      config.port = config.port || 27017;
      uri += `${config.host!}:${config.port!}/${config.database!}`;

      MongoClient.connect(uri)
        .then(client => client.db(config.database)!)
        .then(db => (this.instance = db))
        .then(() => {
          resolve();
          const bootstrapListeners = this.injector.get(
            DATABASE_BOOTSTRAP_LISTENER,
            []
          );
          bootstrapListeners.forEach(l => l());
        })
        .catch(() => {
          resolve();
          const failListeners = this.injector.get(
            DATABASE_FAILURE_LISTENER,
            []
          );
          failListeners.forEach(l => l());
        });
    });
  }

  getDatabaseInstance(): Db {
    return this.instance;
  }
}
