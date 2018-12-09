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
  outputHashing: OutputHashing;
  verbose: boolean;
  sourceMap: boolean;
  optimization?: boolean;
  fileReplacements: FileReplacement[];
  extractLicenses: boolean;
  extractDependencies: boolean;
  deleteOutputPath: boolean;
}

export enum OutputHashing {
  All = 'all',
  Bundles = 'bundles',
  Media = 'media',
  None = 'none',
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