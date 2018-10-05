import { JsonObject, join, normalize, relative, strings } from '@angular-devkit/core';
import {
  MergeStrategy,
  Rule,
  SchematicContext,
  SchematicsException,
  Tree,
  apply,
  chain,
  filter,
  mergeWith,
  move,
  noop,
  schematic,
  template,
  url,
} from '@angular-devkit/schematics';

import { Schema as ApplicationOptions } from './schema';
import { Schema as WorkspaceOptions } from '../workspace/schema';
import { WorkspaceProject, addProjectToWorkspace, getWorkspace, WorkspaceSchema } from '../utility/config'



function addDependenciesToPackageJson() {
  return (host: Tree) => {
    const packageJsonPath = 'package.json';

    if (!host.exists('package.json')) { return host; }

    const source = host.read('package.json');
    if (!source) { return host; }

    const sourceText = source.toString('utf-8');
    const json = JSON.parse(sourceText);

    if (!json['devDependencies']) {
      json['devDependencies'] = {};
    }

    json.devDependencies = {
      '@angular/compiler': "6.0.0",
      '@angular/compiler-cli': "6.0.0",
      '@ng-ally/devkit': "0.0.0-PLACEHOLDER",
      'typescript': "2.7.2",
      // De-structure last keeps existing user dependencies.
      ...json.devDependencies,
    };

    host.overwrite(packageJsonPath, JSON.stringify(json, null, 2));

    return host;
  };
}

function addAppToWorkspaceFile(options: ApplicationOptions, workspace: WorkspaceSchema): Rule {

  let projectRoot = options.projectRoot !== undefined
    ? options.projectRoot
    : `/${options.name}`;
  if (projectRoot !== '' && !projectRoot.endsWith('/')) {
    projectRoot += '/';
  }
  const rootFilesRoot = options.projectRoot === undefined
    ? projectRoot
    : projectRoot + 'src/';

  const schematics: JsonObject = {};

  const project: WorkspaceProject = {
    root: projectRoot,
    projectType: 'application',
    prefix: 'app',
    schematics,
    architect: {
      build: {
        builder: '@ng-ally/devkit:build',
        options: {
          outputPath: `dist/${options.name}`,
          main: `${projectRoot}src/main.ts`,
          polyfills: `${projectRoot}src/polyfills.ts`,
          tsConfig: `${rootFilesRoot}tsconfig.app.json`
        },
        configurations: {
          production: {
            fileReplacements: [{
              replace: `${projectRoot}src/environments/environment.ts`,
              with: `${projectRoot}src/environments/environment.prod.ts`,
            }]
          },
        },
      },
      serve: {
        builder: '@ng-ally/devkit:dev-server',
        options: {
          buildTarget: `${options.name}:build`,
        },
        configurations: {
          production: {
            buildTarget: `${options.name}:build:production`,
          },
        },
      },
    },
  };
  return addProjectToWorkspace(workspace, options.name, project);
}

export default function (options: ApplicationOptions): Rule {
  return (host: Tree, context: SchematicContext) => {
    if (!options.name) {
      throw new SchematicsException(`Invalid options, "name" is required.`);
    }


    const workspace = getWorkspace(host);

    let newProjectRoot = workspace.newProjectRoot;
    let appDir = `${newProjectRoot}/${options.name}`;
    let sourceRoot = `${appDir}/src`;
    let sourceDir = `${sourceRoot}/app`;
    let relativePathToWorkspaceRoot = appDir.split('/').map(x => '..').join('/');
    const rootInSrc = options.projectRoot !== undefined;
    if (options.projectRoot !== undefined) {
      newProjectRoot = options.projectRoot;
      appDir = `${newProjectRoot}/src`;
      sourceRoot = appDir;
      sourceDir = `${sourceRoot}/app`;
      relativePathToWorkspaceRoot = relative(normalize('/' + sourceRoot), normalize('/'));
      if (relativePathToWorkspaceRoot === '') {
        relativePathToWorkspaceRoot = '.';
      }
    }


    return chain([
        addAppToWorkspaceFile(options, workspace),
        addDependenciesToPackageJson(),

        mergeWith(
        apply(url('./files/src'), [
            template({
            utils: strings,
            ...options,
            'dot': '.',
            relativePathToWorkspaceRoot,
            }),
            move(sourceRoot),
        ])
        ),

        mergeWith(
            apply(url('./files/root'), [
            template({
                utils: strings,
                ...options,
                'dot': '.',
                relativePathToWorkspaceRoot,
                rootInSrc,
            }),
            move(appDir),
            ])
        )
    ])(host, context);
  };
}