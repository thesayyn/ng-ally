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
  tags,
  virtualFs
} from "@angular-devkit/core";
import { AngularCompilerPlugin, PLATFORM } from "@ngtools/webpack";
import * as CopyWebpackPlugin from "copy-webpack-plugin";
import { LicenseWebpackPlugin } from "license-webpack-plugin";
import { Observable, concat, of } from "rxjs";
import { concatMap, last, tap } from "rxjs/operators";
import * as webpack from "webpack";
import * as WebpackNodeExternals from "webpack-node-externals";
import * as ProgressPlugin from "webpack/lib/ProgressPlugin";
import { AssetPattern, ServerBuilderSchema } from "./schema";
import { ChunkMergeWebpackPlugin } from "./chunk_merge";
import { statsToString, getOutputHashFormat } from "./utilities";

export class ServerBuilder implements Builder<ServerBuilderSchema> {
  public plugins: webpack.Plugin[] = [];
  public entrypoints: { [key: string]: string[] } = {};

  constructor(public context: BuilderContext) {}

  run(
    builderConfig: BuilderConfiguration<ServerBuilderSchema>
  ): Observable<BuildEvent> {
    const options = builderConfig.options;
    const root = this.context.workspace.root;
    const config = this.buildWebpackConfig(root, builderConfig.options);
    return of(null).pipe(
      concatMap(() =>
        options.deleteOutputPath
          ? this._deleteOutputDir(root, normalize(options.outputPath), this
              .context.host as any)
          : of(null)
      ),
      concatMap(
        () =>
          new Observable(observer => {
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
                  statsJson.warnings.map(
                    (warning: any) => `WARNING in ${warning}`
                  )
                  .join("\n\n")
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
          })
      )
    );
  }

  buildWebpackConfig(
    root: Path,
    options: ServerBuilderSchema
  ): webpack.Configuration {
    let extraPlugins: webpack.Plugin[] = [];

    const hashFormat = getOutputHashFormat(options.outputHashing || "none");

    let assets: any[] = [];
    if (options.assets) {
      assets = options.assets.map((asset: AssetPattern) => {
        return {
          context: asset.input,
          to: asset.output,
          from: {
            glob: asset.glob,
            dot: true
          }
        };
      });
    }

    if (options.extractDependencies) {
      assets = [...assets, { from: "./package.json", to: "./package.json" }];
    }

    if (options.assets || options.extractDependencies) {
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
        const replace = getSystemPath(
          normalize(resolve(root, normalize(replacement.replace)))
        );
        hostReplacementPaths[replace] = getSystemPath(
          normalize(resolve(root, normalize(replacement.with)))
        );
      }
    }

    if (options.polyfills) {
      this.entrypoints.polyfills = this.entrypoints.polyfills || [];
      this.entrypoints.polyfills.push(
        getSystemPath(normalize(resolve(root, normalize(options.polyfills))))
      );
    }

    
    if (options.main) {
      this.entrypoints.main = this.entrypoints.main || [];
      this.entrypoints.main.push(
        getSystemPath(normalize(resolve(root, normalize(options.main))))
      );
    }


    return {
      context: getSystemPath(root),
      devtool: sourcemaps,
      target: "node",
      mode: options.optimization ? "production" : "development",
      watch: options.watch,
      entry: this.entrypoints,
      output: {
        path: getSystemPath(resolve(root, normalize(options.outputPath))),
        filename: `[name]${hashFormat.chunk}.js`,
        devtoolModuleFilenameTemplate: "[absolute-resource-path]"
      },
      resolve: {
        extensions: [".ts", ".mjs", ".js"],
        symlinks: options.preserveSymlinks!,
        modules: ["node_modules"]
      },
      module: {
        rules: [
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
          whitelist: [/@angular\/(core|compiler)/, /@ng-ally\/.*/],
          
        })
      ],
      plugins: [
        new AngularCompilerPlugin({
          tsConfigPath: getSystemPath(
            normalize(resolve(root, normalize(options.tsConfig)))
          ),
          mainPath: getSystemPath(
            normalize(resolve(root, normalize(options.main)))
          ),
          hostReplacementPaths,
          skipCodeGeneration: true,
          platform: PLATFORM.Server,
          sourceMap: options.sourceMap,
          compilerOptions: {
            preserveSymlinks: options.preserveSymlinks
          }
        }),
        new ChunkMergeWebpackPlugin({
          banner: "/** Automatically generated with @ng-ally/devkit **/",
          outputName: options.outputName,
          chunks: ["polyfills", "main"]
        }),
        ...extraPlugins,
        ...this.plugins
      ]
    };
  }

  private _deleteOutputDir(root: Path, outputPath: Path, host: virtualFs.Host) {
    const resolvedOutputPath = resolve(root, outputPath);
    if (resolvedOutputPath === root) {
      throw new Error("Output path MUST not be project root directory!");
    }

    return host.exists(resolvedOutputPath).pipe(
      concatMap(exists =>
        exists
          ? // TODO: remove this concat once host ops emit an event.
            concat(host.delete(resolvedOutputPath), of(null)).pipe(last())
          : // ? of(null)
            of(null)
      )
    );
  }
}

export default ServerBuilder;
