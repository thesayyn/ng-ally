import { ErrorHandler, ApplicationRef, Injector, createPlatformFactory, PlatformRef, platformCore, COMPILER_OPTIONS, CompilerFactory, StaticProvider, ApplicationInitStatus } from "@angular/core";
import { ServerApplicationRef } from "./application_ref";
import { JitCompilerFactory } from "./compiler";
import { PLATFORM_SERVER_ID } from "./platform_tokens";


export const INTERNAL_SERVER_PLATFORM_PROVIDERS = (): StaticProvider[] => [
    { provide: COMPILER_OPTIONS, useValue: {}, multi: true},
    { provide: CompilerFactory, useClass: JitCompilerFactory, deps: [COMPILER_OPTIONS] }
];


export const platformServer: (extraProviders?: StaticProvider[]) => PlatformRef = createPlatformFactory(platformCore, PLATFORM_SERVER_ID, INTERNAL_SERVER_PLATFORM_PROVIDERS());
