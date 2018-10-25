import { InjectionToken } from "@angular/core";
import { MongoClientOptions } from "mongodb";

export interface DatabaseConfig {
  protocol?: string;
  host: string;
  port?: number;
  database: string;
  username?: string;
  password?: string;
  additionalQueryString?: string;
  options?: MongoClientOptions;
}

export const DATABASE_CONFIG = new InjectionToken<DatabaseConfig>(
  "DATABASE_CONFIG"
);

export const DATABASE_BOOTSTRAP_LISTENER = new InjectionToken<() => void>(
  "DATABASE_BOOTSTRAP_LISTENER"
);
export const DATABASE_FAILURE_LISTENER = new InjectionToken<(error?: any) => void>(
  "DATABASE_FAILURE_LISTENER"
);
