import { BuildEvent, Builder, BuilderConfiguration, BuilderContext } from '@angular-devkit/architect';
import { Path, getSystemPath, resolve, tags, virtualFs } from '@angular-devkit/core';
import { Observable, of } from 'rxjs';

export interface DevServerBuilderOptions {
    browserTarget: string;
    port: number;
    host: string;
    proxyConfig?: string;
    ssl: boolean;
    sslKey?: string;
    sslCert?: string;
    open: boolean;
    liveReload: boolean;
    publicHost?: string;
    servePath?: string;
    disableHostCheck: boolean;
    hmr: boolean;
    watch: boolean;
    hmrWarning: boolean;
    servePathDefaultWarning: boolean;
}


  
export class DevServerBuilder implements Builder<DevServerBuilderOptions> {

    constructor(public context: BuilderContext) { }
    
  
    run(builderConfig: BuilderConfiguration<DevServerBuilderOptions>): Observable<BuildEvent>{
        return of({ success: true })
    }
}

export default DevServerBuilder;