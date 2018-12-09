import * as webpack from "webpack";

export class ChunkMergeWebpackPlugin implements webpack.Plugin {
  constructor(private options: Options) {}

  apply(compiler: webpack.Compiler): void {
    compiler.hooks.emit.tap("ChunkMergeWebpackPlugin", compilation => {

      let content = `${this.options.banner}\n`;

      compilation
      .chunks
      .filter( (c: webpack.compilation.Chunk) => this.options.chunks.indexOf(c.name) > -1)
      .sort((c: webpack.compilation.Chunk) => this.options.chunks.indexOf(c.name))
      .map( (c: webpack.compilation.Chunk) => {
        content += `/** chunk ${c.name}.${c.renderedHash} **/\n`
        content += `${c.files.map( f => `require('./${f.replace('.js', '')}');\n` )}`
      })

      compilation.assets[this.options.outputName] = {
        source: () => content,
        size: () => content.length
      };
    });
  }
}

export interface Options {
  banner: string;
  outputName: string;
  chunks: string[];
}

export interface Entries {
  [key: string]: TemplateStringsArray | string;
}
