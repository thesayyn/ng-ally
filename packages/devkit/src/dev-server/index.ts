import {
  Builder,
  BuilderConfiguration,
  BuilderContext,
  BuildEvent
} from "@angular-devkit/architect";
import { tags } from "@angular-devkit/core";
import * as path from "path";
import { Observable } from "rxjs";
import { concatMap, tap } from "rxjs/operators";
import * as StartServerWebpackPlugin from "start-server-webpack-plugin";
import { ServerBuilder } from "../build";
import { ServerBuilderSchema } from "../build/schema";
import { DevServerBuilderOptions } from "./schema";

export class DevServerBuilder implements Builder<DevServerBuilderOptions> {
  constructor(public context: BuilderContext) {}

  run(
    builderConfig: BuilderConfiguration<DevServerBuilderOptions>
  ): Observable<BuildEvent> {
    const options = builderConfig.options;
    const root = this.context.workspace.root;

    if (options.inspect && options.inspectBrk) {
      throw new Error(`--inspect-brk and --inspect cannot be used together.`);
    }

    this.context.logger.info(tags.oneLine`
      **
      NgAlly Development Server is listening on ${options.host}:${options.port},
      open your browser on ${options.host}:${options.port}
      **
    `);

    const nodeArgs: string[] = [];

    if (options.inspect) {
      nodeArgs.push(`--inspect=${options.inspectHost}:${options.inspectPort}`);
    } else if (options.inspectBrk) {
      nodeArgs.push(
        `--inspect-brk=${options.inspectHost}:${options.inspectPort}`
      );
    }

    if (options.inspect || options.inspectBrk) {
      this.context.logger.warn(tags.oneLine`
      **
       Inspect mode enabled on ${options.inspectHost}:${options.inspectPort}. 
       for further information check: https://nodejs.org/en/docs/guides/debugging-getting-started/
      **
    `);
    }

    const serverBuilder: ServerBuilder = new ServerBuilder(this.context);
    let serverBuilderConfig: ServerBuilderSchema;

    return this.getBuildTargetOptions(options).pipe(
      tap(cfg => {
        serverBuilderConfig = cfg.options as ServerBuilderSchema;

        serverBuilder.extraPlugins.push(
          new StartServerWebpackPlugin({
            name: serverBuilderConfig.outputName,
            args: [
              path.resolve(
                root,
                serverBuilderConfig.outputPath,
                serverBuilderConfig.outputName
              ),
              options.host,
              options.port.toString()
            ],
            nodeArgs
          })
        );
      }),
      concatMap((cfg: any) => serverBuilder.run(cfg)),
      tap(() => console.log("dsadads"))
    );
  }

  getBuildTargetOptions(options: DevServerBuilderOptions) {
    const architect = this.context.architect;
    const [project, target, configuration] = options.buildTarget.split(":");
    const overrides = {
      watch: true,
      verbose: options.verbose,
      progress: options.progress,
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
