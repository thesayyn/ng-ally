import {
  CompilerFactory,
  COMPILER_OPTIONS,
  createPlatformFactory,
  platformCore,
  PlatformRef,
  StaticProvider
} from "@angular/core";
import { JitCompilerFactory } from "./compiler";
import { PLATFORM_SERVER_ID } from "./platform_tokens";

export const INTERNAL_SERVER_PLATFORM_PROVIDERS = (): StaticProvider[] => [
  { provide: COMPILER_OPTIONS, useValue: {}, multi: true },
  {
    provide: CompilerFactory,
    useClass: JitCompilerFactory,
    deps: [COMPILER_OPTIONS]
  }
];

export const platformServer: (
  extraProviders?: StaticProvider[]
) => PlatformRef = createPlatformFactory(
  platformCore,
  PLATFORM_SERVER_ID,
  INTERNAL_SERVER_PLATFORM_PROVIDERS()
);
