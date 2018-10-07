import {
  Builder,
  BuilderConfiguration,
  BuilderContext,
  BuildEvent
} from "@angular-devkit/architect";
import { tags, logging } from "@angular-devkit/core";
import { Observable } from "rxjs";
import { concatMap, tap } from "rxjs/operators";
import { ServerBuilder } from "../build";
import { ServerBuilderSchema } from "../build/schema";
import { DevServerBuilderOptions } from "./schema";
import { ClusterWebpackPlugin } from "./cluster_webpack";

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
      open your browser on http://${options.host}:${options.port}
      **
    `);

    if (options.inspect || options.inspectBrk) {
      this.context.logger.info(tags.oneLine`
      **
       Inspect mode enabled on ${options.inspectHost}:${options.inspectPort}. 
      **
      `);
    }

    const nodeArgs: string[] = [];
    if (options.inspect) {
      nodeArgs.push(`--inspect=${options.inspectHost}:${options.inspectPort}`);
    } else if (options.inspectBrk) {
      nodeArgs.push(
        `--inspect-brk=${options.inspectHost}:${options.inspectPort}`
      );

      this.context.logger.warn(tags.stripIndents`
       Attention: Inspect and break mode enabled. The server wouldn't start to work until you connect to the inspector agent.
       for further information check: https://nodejs.org/en/docs/guides/debugging-getting-started/
      `);
    }

    const serverBuilder: ServerBuilder = new ServerBuilder(this.context);
    let serverBuilderConfig: ServerBuilderSchema;

    return this.getBuildTargetOptions(options).pipe(
      tap(cfg => {
        serverBuilderConfig = cfg.options as ServerBuilderSchema;
        serverBuilder.plugins.push(
          new ClusterWebpackPlugin({
            name: serverBuilderConfig.outputName,
            args: [options.host, options.port.toString()],
            execArgv: nodeArgs,
            inspectPort: options.inspectPort,
            logger: this.context.logger as any as logging.Logger
          })
        );
      }),
      concatMap((cfg: any) => serverBuilder.run(cfg))
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
