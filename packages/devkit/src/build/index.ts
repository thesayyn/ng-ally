import { BuildEvent, Builder, BuilderConfiguration, BuilderContext } from '@angular-devkit/architect';
import { Path, getSystemPath, resolve, tags, virtualFs, normalize } from '@angular-devkit/core';
import { Observable, of } from 'rxjs';
import * as path from 'path';
import * as ts from "typescript";
import * as webpack from "webpack";
import { AngularCompilerPlugin, PLATFORM } from '@ngtools/webpack';
import * as CopyWebpackPlugin from 'copy-webpack-plugin';
import * as StringEntryPlugin from "string-entry-webpack-plugin";
import * as WebpackNodeExternals from "webpack-node-externals";
import { ServerBuilderSchema, AssetPattern } from './schema';
import { statsToString } from './utilities';
  
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
                

                const statsConfig =  {
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
                    moduleTrace: false,
                }

                const statsJson = stats.toJson(statsConfig);
                this.context.logger.info(statsToString(statsJson,statsConfig));

                if(stats.hasWarnings())
                {
                    this.context.logger.warn(statsJson.warnings.map((warning: any) => `WARNING in ${warning}`).filter( w => w.indexOf('dependency is an expression') == -1 ).join('\n\n'));
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

        let extraPlugings: any[] = [];

        if(options.assets)
        {
            const assets = options.assets.map((asset: AssetPattern)=>{
                return {
                    context: asset.input,
                    to: asset.output,
                    from: {
                      glob: asset.glob,
                      dot: true
                    }
                };
            })
            extraPlugings.push(new CopyWebpackPlugin(assets, { ignore: ['.gitkeep', '**/.DS_Store', '**/Thumbs.db'] }));
        }

        return {
            context: getSystemPath(root),
            devtool: 'source-map',
            target: 'node',
            watch: options.watch,
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
                    {
                        test: /\.node$/,
                        loader: 'node-loader'
                    },
                    {
                        test: /\.ts$/,
                        loader: '@ngtools/webpack'
                    }
                ]
            },
            externals: [
                WebpackNodeExternals({
                    whitelist: [
                        /@angular\/.*/,
                        /@ng-ally\/.*/,
                        /^rxjs\/.*/
                    ]
                }),
            ],
            plugins: [
                new AngularCompilerPlugin({
                    tsConfigPath: getSystemPath(normalize(resolve(root, normalize(options.tsConfig)))),
                    mainPath: getSystemPath(normalize(resolve(root, normalize(options.main)))),
                    skipCodeGeneration: true,
                    platform: PLATFORM.Server,
                }),
                new StringEntryPlugin({
                    'server.js': `global['XMLHttpRequest'] = require('xmlhttprequest').XMLHttpRequest;require('./polyfills');require('./main');`
                }),
                ...extraPlugings
            ]
        };

    }
}

export default ServerBuilder;

