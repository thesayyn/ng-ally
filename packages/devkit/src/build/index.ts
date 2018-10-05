import {
  Builder,
  BuilderConfiguration,
  BuilderContext,
  BuildEvent
} from "@angular-devkit/architect";
import {
  getSystemPath,
  normalize,
  Path,
  resolve,
  tags
} from "@angular-devkit/core";
import { Observable } from "rxjs";
import * as path from "path";

import { AssetPattern, ServerBuilderSchema } from "./schema";
import { statsToString } from "./utilities";

import * as webpack from "webpack";
import { AngularCompilerPlugin, PLATFORM } from "@ngtools/webpack";
import * as StringEntryWebpackPlugin from "string-entry-webpack-plugin";
import * as WebpackNodeExternals from "webpack-node-externals";
import * as CopyWebpackPlugin from "copy-webpack-plugin";
import * as ProgressPlugin from "webpack/lib/ProgressPlugin";
import { LicenseWebpackPlugin } from "license-webpack-plugin";

export class ServerBuilder implements Builder<ServerBuilderSchema> {
  public extraPlugins: webpack.Plugin[] = [];
  constructor(public context: BuilderContext) {}

  run(
    builderConfig: BuilderConfiguration<ServerBuilderSchema>
  ): Observable<BuildEvent> {
    return new Observable(observer => {
      const options = builderConfig.options;
      const root = this.context.workspace.root;
      const config = this.buildWebpackConfig(root, builderConfig.options);
      const compiler = webpack(config);

      const callback = (err, stats) => {
        if (err) this.context.logger.error(err.message);

        const statsConfig = {
          colors: true,
          hash: true,
          timings: true,
          chunks: true,
          chunkModules: false,
          children: false,
          modules: false,
          reasons: false,
          warnings: true,
          errors: true,
          assets: true,
          version: false,
          errorDetails: false,
          moduleTrace: false
        };

        const statsJson = stats.toJson(statsConfig);
        this.context.logger.info(statsToString(statsJson, statsConfig));

        if (stats.hasWarnings()) {
          this.context.logger.warn(
            statsJson.warnings.map((warning: any) => `WARNING in ${warning}`)
          );
        }
        if (stats.hasErrors()) {
          this.context.logger.error(
            statsJson.errors
              .map((error: any) => `ERROR in ${error}`)
              .join("\n\n")
          );
        }

        if (options.watch) {
          observer.next({ success: !stats.hasErrors() });
          return;
        } else {
          observer.next({ success: !stats.hasErrors() });
          observer.complete();
        }
      };

      if (options.watch) {
        const watching = compiler.watch({ poll: options.poll }, callback);
        return () => watching.close(() => {});
      } else {
        compiler.run(callback);
      }
    });
  }

  buildWebpackConfig(
    root: Path,
    options: ServerBuilderSchema
  ): webpack.Configuration {
    let extraPlugins: webpack.Plugin[] = [];

    if (options.assets) {
      const assets = options.assets.map((asset: AssetPattern) => {
        return {
          context: asset.input,
          to: asset.output,
          from: {
            glob: asset.glob,
            dot: true
          }
        };
      });
      extraPlugins.push(
        new CopyWebpackPlugin(assets, {
          ignore: [".gitkeep", "**/.DS_Store", "**/Thumbs.db"]
        })
      );
    }

    if (options.extractLicenses) {
      extraPlugins.push((new LicenseWebpackPlugin({
        stats: {
          warnings: false,
          errors: false
        },
        perChunkOutput: false,
        outputFilename: `3rdpartylicenses.txt`
      }) as any) as webpack.Plugin);
    }

    let sourcemaps: webpack.Options.Devtool = false;
    if (options.sourceMap !== false) {
      if (!options.optimization) {
        sourcemaps = "eval";
      } else {
        sourcemaps = "source-map";
      }
    }

    if (options.progress !== false) {
      extraPlugins.push(
        new ProgressPlugin({ profile: options.verbose, colors: true })
      );
    }

    const hostReplacementPaths: { [replace: string]: string } = {};

    if (options.fileReplacements) {
      for (const replacement of options.fileReplacements) {
        hostReplacementPaths[replacement.replace] = replacement.with;
      }
    }

    let entryPoints: { [key: string]: string[] } = {};

    if (options.main) {
      entryPoints["main"] = [path.resolve(root, options.main)];
    }

    if (options.polyfills) {
      entryPoints["polyfills"] = [path.resolve(root, options.polyfills)];
    }

    return {
      context: getSystemPath(root),
      devtool: sourcemaps,
      target: "node",
      mode: options.optimization ? "production" : "development",
      node: false,
      watch: options.watch,
      entry: entryPoints,
      output: {
        path: getSystemPath(resolve(root, normalize(options.outputPath))),
        filename: "[name].js",
        devtoolModuleFilenameTemplate: "[absolute-resource-path]"
      },
      resolve: {
        extensions: [".ts", ".mjs", ".js"],
        symlinks: options.preserveSymlinks!,
        modules: ["node_modules"]
      },
      module: {
        rules: [
          /*{
            test: /\.node$/,
            loader: "node-loader"
          },*/
          {
            // Mark files inside `@angular/core` as using SystemJS style dynamic imports.
            // Removing this will cause deprecation warnings to appear.
            test: /[\/\\]@angular[\/\\]core[\/\\].+\.js$/,
            parser: { system: true }
          },
          {
            test: /\.ts$/,
            loader: "@ngtools/webpack"
          }
        ]
      },
      externals: [
        WebpackNodeExternals({
          whitelist: [/@angular\/.*/, /@ng-ally\/.*/, /^rxjs\/.*/]
        })
      ],
      plugins: [
        new AngularCompilerPlugin({
          tsConfigPath: path.resolve(root, options.tsConfig),
          mainPath: path.resolve(root, options.main),
          skipCodeGeneration: options.aot !== true,
          platform: PLATFORM.Server
        }),
        new StringEntryWebpackPlugin({
          [options.outputName]: tags.stripIndents`
            /** Automatically generated with @ng-ally/devkit **/
            ${options.polyfills ? "require('./polyfills');" : ""}
            ${options.main ? "require('./main');" : ""}   
          `
        }),
        ...extraPlugins,
        ...this.extraPlugins
      ]
    };
  }
}

export default ServerBuilder;
