import * as webpack from "webpack";
import * as path from "path";
import * as cluster from "cluster";
import { logging } from "@angular-devkit/core";

export class ClusterWebpackPlugin implements webpack.Plugin {
  private _worker: cluster.Worker;
  private _logger: logging.Logger;

  constructor(protected options: ClusterOptions) {
    this._logger = options.logger.createChild("cluster");
  }

  _getScript(compilation: webpack.compilation.Compilation): string {
    const outputPath = compilation.outputOptions.path;
    const name = this.options.name;

    const map = compilation.assets;

    if (!(name in map)) {
      throw new Error(
        `Requested entry "${name}" does not exist, try one of: ${Object.keys(
          map
        ).join(", ")}`
      );
    }

    return path.resolve(outputPath, name);
  }

  _startWorker(
    compilation: webpack.compilation.Compilation
  ): Promise<cluster.Worker> {
    return new Promise(resolve => {
      cluster.setupMaster({
        ...(this.options as cluster.ClusterSettings),
        exec: this._getScript(compilation),
        silent: true
      });
      const onlineHandler = worker => {
        resolve(worker);
        cluster.removeListener("online", onlineHandler);
      };
      cluster.on("online", onlineHandler);
      cluster.fork();
    });
  }

  apply(compiler: webpack.Compiler): void {
    compiler.hooks.afterEmit.tapPromise("ClusterWebpackPlugin", compilation => {
      if (this._worker && this._worker.isConnected()) {
        process.kill(this._worker.process.pid);
      }
      return this._startWorker(compilation).then(worker => {
        this._worker = worker;
        this._worker.process.stdout.on("data", message => {
          this._logger.info(message.toString());
        });
        this._worker.process.stderr.on("data", message => {
          this._logger.warn(message.toString());
        });
      });
    });
  }
}

export interface ClusterOptions extends cluster.ClusterSettings {
  name: string;
  logger: logging.Logger;
}
