export interface ServerBuilderSchema {
  tsConfig: string;
  outputPath: string;
  polyfills?: string;
  main: string;

  preserveSymlinks: boolean;
  watch: boolean;
}