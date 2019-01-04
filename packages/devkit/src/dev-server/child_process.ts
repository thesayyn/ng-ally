import * as webpack from 'webpack';
import * as path from 'path';
import * as child_process from 'child_process';
import { logging } from '@angular-devkit/core';

export class ChildProcessWebpackPlugin implements webpack.Plugin {
	private _process: child_process.ChildProcess;
	private _logger: logging.Logger;

	constructor(protected options: ProcessOptions) {
		this._logger = options.logger.createChild('cluster');
	}

	_getScript(compilation: webpack.compilation.Compilation): string {
		const outputPath = compilation.outputOptions.path;
		const name = this.options.name;

		const map = compilation.assets;

		if (!(name in map)) {
			throw new Error(`Requested entry "${name}" does not exist, try one of: ${Object.keys(map).join(', ')}`);
		}

		return path.resolve(outputPath, name);
	}

	_forkProcess(compilation: webpack.compilation.Compilation): Promise<child_process.ChildProcess> {
		return new Promise((resolve) => {
			resolve(
				child_process.fork(this._getScript(compilation), [], {
					...this.options,
					cwd: compilation.outputOptions.path,
					silent: true
				})
			);
		});
	}

	apply(compiler: webpack.Compiler): void {
		compiler.hooks.afterEmit.tapPromise('ChildProcessWebpackPlugin', (compilation) => {
			if (this._process && !this._process.killed) {
				process.kill(this._process.pid);
			}
			return this._forkProcess(compilation).then((process) => {
				this._process = process;
				this._process.stdout.on('data', (message) => {
					this._logger.info(message.toString());
				});
				this._process.stderr.on('data', (message) => {
					this._logger.warn(message.toString());
				});
			});
		});
	}
}

export interface ProcessOptions extends child_process.ForkOptions {
	name: string;
	env?: any;
	logger: logging.Logger;
}
