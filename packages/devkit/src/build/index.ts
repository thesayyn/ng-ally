import { BuildEvent, Builder, BuilderConfiguration, BuilderContext } from '@angular-devkit/architect';
import { Path, getSystemPath, resolve, tags, virtualFs, normalize } from '@angular-devkit/core';
import { Observable, of } from 'rxjs';
import * as path from 'path';
import * as ts from "typescript";
import * as webpack from "webpack";

import * as StringEntryPlugin from "string-entry-webpack-plugin";

import { BuildServerSchema } from './schema';
  
export class DevServerBuilder implements Builder<BuildServerSchema> {

    run(builderConfig: BuilderConfiguration<BuildServerSchema>): Observable<BuildEvent>{
        return new Observable( observer => {
            const options = builderConfig.options;
            const root = this.context.workspace.root;
           /* const tsConfigPath = getSystemPath(normalize(resolve(root, normalize(options.tsConfig))));
            const tsConfigResult = ts.readConfigFile(tsConfigPath, ts.sys.readFile ).config !;
            const tsConfig = ts.parseJsonConfigFileContent( tsConfigResult, ts.sys,  path.dirname(tsConfigPath), undefined, tsConfigPath);
            const program = ts.createProgram(tsConfig.fileNames, tsConfig.options);
            const emitResult = program.emit();*/
    
            this.context.logger.info('Project root path : '+ getSystemPath(root))
            const config: webpack.Configuration = {
                context: getSystemPath(root),
                entry: {
                   main: getSystemPath(normalize(resolve(root, normalize(options.main)))),
                   polyfills: getSystemPath(normalize(resolve(root, normalize(options.polyfills!))))
                },
                mode: 'development',
                devtool: false,
                output: {
                    path:  getSystemPath(normalize(resolve(root, normalize(options.outputPath)))),
                    filename: '[name].js',
                },
                target: 'node',
                resolve: {
                    extensions: ['.ts', '.js']
                },
                module: {
                    rules: [
                        {
                            test: /\.ts$/,
                            loader: 'awesome-typescript-loader',
                            options: {
                                configFileName: getSystemPath(normalize(resolve(root, normalize(options.tsConfig))))
                            }
                        }
                    ]
                },
                plugins: [
                    new StringEntryPlugin({
                        'server.js': `global['XMLHttpRequest'] = require('xmlhttprequest').XMLHttpRequest;
                        require('./polyfills');
                        require('./main');`
                    })
                ]
              };
    
              const compiler = webpack(config)
              const callback: webpack.compiler.CompilerCallback = (err, stats) => {
                if (err) {
                  return this.context.logger.error(err.message);
                }
                this.context.logger.info('dsadsad');
                observer.next({ success: true });
    
                this.context.logger.warn(stats.toString());
              };
    
              try {
                compiler.run(callback);
              } catch (err) {
                if (err) {
                  this.context.logger.error(
                    '\nAn error occured during the build:\n' + ((err && err.stack) || err));
                }
                throw err;
              }
              
    
              this.context.logger.error('wewew');

        })
    }
    constructor(public context: BuilderContext) { }
    
  
}

export default DevServerBuilder;