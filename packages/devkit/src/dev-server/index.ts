import {
  BuildEvent,
  Builder,
  BuilderConfiguration,
  BuilderContext
} from "@angular-devkit/architect";
import {
  getSystemPath,
  resolve,
  normalize
} from "@angular-devkit/core";
import { Observable } from "rxjs";
import { concatMap, map, tap, switchMap } from "rxjs/operators";
import { ChildProcess, spawn, SpawnOptions } from "child_process";
import { ServerBuilderSchema } from "../build/schema";
import { ServerBuilder } from "../build";
import chalk from "chalk";

export interface DevServerBuilderOptions {
  buildTarget: string;
  port: number;
  host: string;
  preserveSymlinks: boolean;
}

export class DevServerBuilder implements Builder<DevServerBuilderOptions> {
  constructor(public context: BuilderContext) {}

  run(
    builderConfig: BuilderConfiguration<DevServerBuilderOptions>
  ): Observable<BuildEvent> {
    const options = builderConfig.options;
    const root = this.context.workspace.root;

    const serverBuilder: ServerBuilder = new ServerBuilder(this.context);
    let serverBuilderConfig: ServerBuilderSchema;

    return this.getBuildTargetOptions(options).pipe(
      tap((cfg: any) => (serverBuilderConfig = cfg.options)),
      concatMap((cfg: any) => serverBuilder.run(cfg)),
      switchMap(buildEvent => {
        const outFile = getSystemPath(
          normalize(
            resolve(
              root,
              normalize(serverBuilderConfig.outputPath + "/server.js")
            )
          )
        );
        const cwd = getSystemPath(
          normalize(resolve(root, normalize(serverBuilderConfig.outputPath)))
        );
        return this.createNodeProcess(outFile, {
          stdio: "inherit",
          cwd: cwd
        }).pipe(
          map(() => {
            this.context.logger.info(chalk.italic("🎉 Server started."));
            return buildEvent;
          })
        );
      })
    );
  }

  createNodeProcess(
    scriptPath: string,
    options?: SpawnOptions
  ): Observable<ChildProcess> {
    return new Observable(observer => {
      const child = spawn(
        "node",
        ["-r", "source-map-support/register", scriptPath],
        options
      );
      child.on("error", error => observer.error(error));
      child.on("close", () => observer.complete());
      child.on("exit", () => observer.complete());
      observer.next();
      return () => {
        process.kill(child.pid, "SIGKILL");
        child.kill("SIGKILL");
      };
    });
  }

  getBuildTargetOptions(options: DevServerBuilderOptions) {
    const architect = this.context.architect;
    const [project, target, configuration] = options.buildTarget.split(":");
    const overrides = {
      watch: true,
      preserveSymlinks: options.preserveSymlinks
    };
    const buildTargetSpec = { project, target, configuration, overrides };
    const builderConfig = architect.getBuilderConfiguration(buildTargetSpec);
    return architect
      .getBuilderDescription(builderConfig)
      .pipe(
        concatMap(desc => architect.validateBuilderOptions(builderConfig, desc))
      );
  }
}

export default DevServerBuilder;
