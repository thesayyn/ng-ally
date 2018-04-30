import { InjectionToken } from '@angular/core'
import { Db, MongoClientOptions } from 'mongodb'

export interface DatabaseConfig{
    host: string;
    port?: number;
    database: string;
    username?: string;
    password?: string;
    options?: MongoClientOptions;
}

export const DATABASE_CONFIG = new InjectionToken<DatabaseConfig>('Database config.');
