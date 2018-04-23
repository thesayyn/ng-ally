import { BuildEvent, Builder, BuilderConfiguration, BuilderContext } from '@angular-devkit/architect';
import { Path, getSystemPath, resolve, tags, virtualFs, normalize } from '@angular-devkit/core';
import { Observable, of, config } from 'rxjs';
import { concatMap, map, tap } from 'rxjs/operators'
import { exec, ChildProcess } from 'child_process';
import { ServerBuilderSchema } from '../build/schema';
import { ServerBuilder } from '../build';

export interface DevServerBuilderOptions {
    buildTarget: string;
    port: number;
    host: string;
}


export class DevServerBuilder implements Builder<DevServerBuilderOptions> {

    constructor(public context: BuilderContext) { }
    
  
    run(builderConfig: BuilderConfiguration<DevServerBuilderOptions>): Observable<BuildEvent>{
        const options = builderConfig.options;
        const root = this.context.workspace.root;

        const serverBuilder: ServerBuilder = new ServerBuilder(this.context);
        let serverBuilderConfig: ServerBuilderSchema;

        let process: ChildProcess;

        return this.getBuildTargetOptions(options)
        .pipe(
            tap( (cfg: any) => serverBuilderConfig = cfg.options ),
            concatMap( (cfg: any) => serverBuilder.run(cfg) ),
            map( event => {
                const outFile = getSystemPath(normalize(resolve(root, normalize(serverBuilderConfig.outputPath+'/server.js'))))
                console.log(outFile, serverBuilderConfig);
                if(process && !process.killed) process.kill();
                process = exec('node '+outFile);
                process.on('message', data => {
                    this.context.logger.info(data);
                })
                process.on('error', error => {
                    this.context.logger.error(error.message);
                })
                
                return event;
            })
        )
    }


    getBuildTargetOptions(options: DevServerBuilderOptions){
        const architect = this.context.architect;
        const [project, target, configuration] = options.buildTarget.split(':');
        const overrides = { watch: true };
        const buildTargetSpec = {  project, target, configuration, overrides }
        const builderConfig = architect.getBuilderConfiguration(buildTargetSpec);
        return architect.getBuilderDescription(builderConfig).pipe(
            concatMap( desc => architect.validateBuilderOptions(builderConfig, desc) )
        )
    }
}

export default DevServerBuilder;