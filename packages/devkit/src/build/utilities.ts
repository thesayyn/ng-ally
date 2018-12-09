import { tags } from "@angular-devkit/core";
import * as chalk from "chalk";

// Force basic color support on terminals with no color support.
// Chalk typings don't have the correct constructor parameters.
const chalkCtx = new (chalk.constructor as any)(
  chalk["supportsColor"] ? {} : { level: 1 }
);
const { bold, green, reset, white, yellow } = chalkCtx;

export function formatSize(size: number): string {
  if (size <= 0) {
    return "0 bytes";
  }

  const abbreviations = ["bytes", "kB", "MB", "GB"];
  const index = Math.floor(Math.log(size) / Math.log(1000));

  return `${+(size / Math.pow(1000, index)).toPrecision(3)} ${
    abbreviations[index]
  }`;
}

export function statsToString(json: any, statsConfig: any) {
  const colors = statsConfig.colors;
  const rs = (x: string) => (colors ? reset(x) : x);
  const w = (x: string) => (colors ? bold(white(x)) : x);
  const g = (x: string) => (colors ? bold(green(x)) : x);
  const y = (x: string) => (colors ? bold(yellow(x)) : x);

  const changedChunksStats = json.chunks
    .filter((chunk: any) => chunk.rendered)
    .map((chunk: any) => {
      const asset = json.assets.filter((x: any) => x.name == chunk.files[0])[0];
      const size = asset ? ` ${formatSize(asset.size)}` : "";
      const files = chunk.files.join(", ");
      const names = chunk.names ? ` (${chunk.names.join(", ")})` : "";
      const initial = y(
        chunk.entry ? "[entry]" : chunk.initial ? "[initial]" : ""
      );
      const flags = ["rendered", "recorded"]
        .map(f => (f && chunk[f] ? g(` [${f}]`) : ""))
        .join("");

      return `chunk {${y(chunk.id)}} ${g(
        files
      )}${names}${size} ${initial}${flags}`;
    });

  const unchangedChunkNumber = json.chunks.length - changedChunksStats.length;

  if (unchangedChunkNumber > 0) {
    return (
      "\n" +
      rs(tags.stripIndents`
        Date: ${w(new Date().toISOString())} - Hash: ${w(
        json.hash
      )} - Time: ${w("" + json.time)}ms
        ${unchangedChunkNumber} unchanged chunks
        ${changedChunksStats.join("\n")}
        `)
    );
  } else {
    return (
      "\n" +
      rs(tags.stripIndents`
        Date: ${w(new Date().toISOString())}
        Hash: ${w(json.hash)}
        Time: ${w("" + json.time)}ms
        ${changedChunksStats.join("\n")}
        `)
    );
  }
}

// https://github.com/angular/angular-cli/blob/master/packages/angular_devkit/build_angular/src/angular-cli-files/models/webpack-configs/utils.ts#L35
export interface HashFormat {
  chunk: string;
  extract: string;
  file: string;
  script: string;
}

export function getOutputHashFormat(option: string, length = 20): HashFormat {
  /* tslint:disable:max-line-length */
  const hashFormats: { [option: string]: HashFormat } = {
    none: { chunk: "", extract: "", file: "", script: "" },
    media: { chunk: "", extract: "", file: `.[hash:${length}]`, script: "" },
    bundles: {
      chunk: `.[chunkhash:${length}]`,
      extract: `.[contenthash:${length}]`,
      file: "",
      script: `.[hash:${length}]`
    },
    all: {
      chunk: `.[chunkhash:${length}]`,
      extract: `.[contenthash:${length}]`,
      file: `.[hash:${length}]`,
      script: `.[hash:${length}]`
    }
  };
  /* tslint:enable:max-line-length */
  return hashFormats[option] || hashFormats["none"];
}
