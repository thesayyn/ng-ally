export interface DevServerBuilderOptions {
    buildTarget: string;
    host: string;
    port: number;
    inspect: boolean;
    inspectBrk: boolean;
    inspectHost: string;
    inspectPort: number;
    verbose: boolean;
    progress: boolean;
    preserveSymlinks: boolean;
    includeEnv: boolean;
  }
  