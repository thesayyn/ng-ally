import * as webpack from "webpack";

export class StringEntriesWebpackPlugin implements webpack.Plugin {
  constructor(private entries: Entries) {}

  apply(compiler: webpack.Compiler): void {
    compiler.hooks.emit.tap("StringEntriesWebpackPlugin", compilation => {
      for (const entryName in this.entries) {
        if (this.entries.hasOwnProperty(entryName)) {
          const entryContent = this.entries[entryName];
          compilation.assets[entryName] = {
            source: () => entryContent,
            size: () => entryContent.length
          };
        }
      }
    });
  }
}

export interface Entries {
  [key: string]: TemplateStringsArray | string;
}
