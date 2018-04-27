export interface ServerBuilderSchema {
  assets: AssetPattern[];
  tsConfig: string;
  outputPath: string;
  polyfills?: string;
  main: string;

  preserveSymlinks: boolean;
  watch: boolean;
}

export interface AssetPattern {
  glob: string;
  input: string;
  output: string;
}