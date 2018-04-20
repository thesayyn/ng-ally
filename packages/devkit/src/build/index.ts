import { BuildEvent, Builder, BuilderConfiguration, BuilderContext } from '@angular-devkit/architect';
import { Path, getSystemPath, resolve, tags, virtualFs } from '@angular-devkit/core';
import { Observable, of } from 'rxjs';

import { BuildServerSchema } from './schema';

  
export class DevServerBuilder implements Builder<BuildServerSchema> {

    run(builderConfig: BuilderConfiguration<BuildServerSchema>): Observable<BuildEvent>{
        return of({ success: true })
    }
    constructor(public context: BuilderContext) { }
    
  
}

export default DevServerBuilder;