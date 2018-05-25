import { BuildEvent, Builder, BuilderConfiguration, BuilderContext } from '@angular-devkit/architect';
import { Path, getSystemPath, resolve, tags, virtualFs, normalize } from '@angular-devkit/core';
import { Observable, of, config } from 'rxjs';
import { concatMap, map, tap, switchMap } from 'rxjs/operators'
import { ChildProcess, spawn } from 'child_process';
import { ServerBuilderSchema } from '../build/schema';
import { ServerBuilder } from '../build';
import chalk from 'chalk'

export interface DevServerBuilderOptions {
    buildTarget: string;
    port: number;
    host: string;
    preserveSymlinks: boolean;
}


export class DevServerBuilder implements Builder<DevServerBuilderOptions> {

    constructor(public context: BuilderContext) { }
    
  
    run(builderConfig: BuilderConfiguration<DevServerBuilderOptions>): Observable<BuildEvent>{
        const options = builderConfig.options;
        const root = this.context.workspace.root;

        const serverBuilder: ServerBuilder = new ServerBuilder(this.context);
        let serverBuilderConfig: ServerBuilderSchema;

        let process: ChildProcess;
        let first: boolean = true;
        return this.getBuildTargetOptions(options)
        .pipe(
            tap( (cfg: any) => serverBuilderConfig = cfg.options ),
            concatMap( (cfg: any) => serverBuilder.run(cfg) ),
            concatMap( event => new Observable( observer => {
                const outFile = getSystemPath(normalize(resolve(root, normalize(serverBuilderConfig.outputPath+'/server.js'))))
                const cwd = getSystemPath(normalize(resolve(root, normalize(serverBuilderConfig.outputPath))))

                try{
                    process.kill();
                }catch{}
                
                process = spawn('node', [ '-r', 'source-map-support/register', outFile ], {stdio: 'inherit', cwd: cwd});
                process.on('exit', (code,signal)=>{
                   this.context.logger.error(tags.stripIndent`Server exited with code ${code}. (${signal}) `)
                })
                
                if(first)
                {
                    this.context.logger.info(chalk.italic('🎉 Server started.'));
                    first = false;
                }else{
                    this.context.logger.info(chalk.bold('Bundle changed restarting server.'));
                }

                
                observer.next(event);
                return ()=>{
                    try{
                        process.kill();
                    }catch{}
                }
            }))
        )
    }


    getBuildTargetOptions(options: DevServerBuilderOptions){
        const architect = this.context.architect;
        const [project, target, configuration] = options.buildTarget.split(':');
        const overrides = { watch: true, preserveSymlinks: options.preserveSymlinks };
        const buildTargetSpec = {  project, target, configuration, overrides }
        const builderConfig = architect.getBuilderConfiguration(buildTargetSpec);
        return architect.getBuilderDescription(builderConfig).pipe(
            concatMap( desc => architect.validateBuilderOptions(builderConfig, desc) )
        )
    }
}

export default DevServerBuilder;