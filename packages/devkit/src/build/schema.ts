export interface BuildServerSchema {
    tsConfig: string;
    outputPath: string;
    polyfills?: string;
    main: string;
  }