import { BuildEvent, Builder, BuilderConfiguration, BuilderContext } from '@angular-devkit/architect';
import { Path, getSystemPath, resolve, tags, virtualFs, normalize } from '@angular-devkit/core';
import { Observable, of } from 'rxjs';
import * as path from 'path';
import * as ts from "typescript";
import * as webpack from "webpack";
import { AngularCompilerPlugin, PLATFORM } from '@ngtools/webpack'

import * as StringEntryPlugin from "string-entry-webpack-plugin";

import { ServerBuilderSchema } from './schema';
  
export class ServerBuilder implements Builder<ServerBuilderSchema> {

    constructor(public context: BuilderContext) { }

    run(builderConfig: BuilderConfiguration<ServerBuilderSchema>): Observable<BuildEvent>{

        return new Observable( observer => {
            const options = builderConfig.options;
            const root = this.context.workspace.root;
            const config = this.buildWebpackConfig(root, builderConfig.options);
        
            const compiler = webpack(config)

            const callback = (err, stats) => {
                if (err) this.context.logger.error(err.message);
                
                const statsJson = stats.toJson();
                if(stats.hasWarnings())
                {
                    //this.context.logger.warn(statsJson.warnings.map((warning: any) => `WARNING in ${warning}`).join('\n\n'));
                }
                if(stats.hasErrors())
                {
                    this.context.logger.error(statsJson.errors.map((error: any) => `ERROR in ${error}`).join('\n\n'));
                }

                

                if(options.watch)
                {
                    observer.next({ success: !stats.hasErrors() });
                    return;
                }
                else
                {
                    observer.next({ success: !stats.hasErrors() });
                    observer.complete();
                }
            };

            if(options.watch)
            {
                const watching = compiler.watch({}, callback);
                return () => watching.close(()=> {});
            }
            else
            {
                compiler.run(callback);
            }

        })
    }


    buildWebpackConfig(root: Path, options: ServerBuilderSchema): webpack.Configuration
    {
       return {
            context: getSystemPath(root),
            mode: 'development',
            devtool: false,
            target: 'node',
            watch: options.watch,
            watchOptions: {
                poll: 100,
            },
            entry: {
                main: getSystemPath(normalize(resolve(root, normalize(options.main)))),
                polyfills: getSystemPath(normalize(resolve(root, normalize(options.polyfills!))))
            },
            output: {
                path:  getSystemPath(normalize(resolve(root, normalize(options.outputPath)))),
                filename: '[name].js',
            },
            resolve: {
                extensions: ['.ts', '.js'],
                symlinks: options.preserveSymlinks!
            },
            module: {
                rules: [
                  /*  {
                        test: /\.ts$/,
                        loader: 'awesome-typescript-loader',
                        options: {
                            configFileName: getSystemPath(normalize(resolve(root, normalize(options.tsConfig)))),
                            silent: true
                        }
                    }*/
                    {
                        test: /\.ts$/,
                        loader: '@ngtools/webpack'
                    }
                ]
            },
            plugins: [
                new AngularCompilerPlugin({
                    tsConfigPath: getSystemPath(normalize(resolve(root, normalize(options.tsConfig)))),
                    mainPath: getSystemPath(normalize(resolve(root, normalize(options.main)))),
                    skipCodeGeneration: true,
                    platform: PLATFORM.Server
                }),
                new StringEntryPlugin({
                    'server.js': `global['XMLHttpRequest'] = require('xmlhttprequest').XMLHttpRequest;require('./polyfills');require('./main');`
                })
            ]
        };

    }
}

export default ServerBuilder;