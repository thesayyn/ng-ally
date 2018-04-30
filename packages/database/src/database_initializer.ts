import { Injectable, Injector, NgModuleRef } from "@angular/core";
import { DatabaseService } from "./database_service";
import { Db, MongoClient } from "mongodb";
import { DATABASE_CONFIG } from "./config";


@Injectable()
export class DatabaseInitializer {

  private instance: Db;

  constructor(private injector: Injector){
  }

  databaseInitializer(): Promise<void>
  {
    const config = this.injector.get(DATABASE_CONFIG);
    return new Promise((resolve,reject)=>{7
      let uri = 'mongodb://';
      if('username' in config && 'password' in config)
      {
        uri+= `${config.username!}:${config.password!}`;
      }
      config.port = config.port || 27017;
      uri+= `${config.host!}:${config.port!}/${config.database!}`;

      MongoClient.connect(uri)
      .then(client => client.db(config.database)!)
      .then(db => this.instance = db)
      .then(()=>resolve())
      .catch(()=>resolve())
    })
  }

  getDatabaseInstance(): Db{
    return this.instance;
  }
 
}