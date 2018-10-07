export interface ServerBuilderSchema {
  assets: AssetPattern[];
  tsConfig: string;
  outputPath: string;
  outputName: string;
  polyfills?: string;
  main: string;
  preserveSymlinks: boolean;
  watch: boolean;
  poll: number;
  progress?: boolean;
  verbose: boolean;
  sourceMap: boolean;
  optimization?: boolean;
  fileReplacements: FileReplacement[];
  extractLicenses: boolean;
  deleteOutputPath: boolean;
}

export interface AssetPattern {
  glob: string;
  input: string;
  output: string;
}

export interface FileReplacement {
  /**
   * The file that should be replaced.
   */
  replace: string;

  /**
   * The file that should replace.
   */
  with: string;
}