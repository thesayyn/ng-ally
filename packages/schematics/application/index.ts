import { JsonObject, normalize, relative, strings } from "@angular-devkit/core";
import {
  apply,
  chain,
  mergeWith,
  move,
  Rule,
  SchematicContext,
  SchematicsException,
  template,
  Tree,
  url
} from "@angular-devkit/schematics";
import {
  addProjectToWorkspace,
  getWorkspace,
  WorkspaceProject,
  WorkspaceSchema
} from "../utility/config";
import { latestVersions } from "../utility/latest-versions";
import { Schema as ApplicationOptions } from "./schema";

function addDependenciesToPackageJson() {
  return (host: Tree) => {
    const packageJsonPath = "package.json";

    if (!host.exists("package.json")) {
      return host;
    }

    const source = host.read("package.json");
    if (!source) {
      return host;
    }

    const sourceText = source.toString("utf-8");
    const json = JSON.parse(sourceText);

    if (!json["devDependencies"]) {
      json["devDependencies"] = {};
    }

    json.devDependencies = {
      "@angular/compiler": latestVersions.Angular,
      "@angular/compiler-cli": latestVersions.Angular,
      "@ng-ally/devkit": latestVersions.NgAlly,
      typescript: latestVersions.TypeScript,
      ...json.devDependencies
    };

    host.overwrite(packageJsonPath, JSON.stringify(json, null, 2));

    return host;
  };
}

function addAppToWorkspaceFile(
  options: ApplicationOptions,
  workspace: WorkspaceSchema
): Rule {
  let projectRoot =
    options.projectRoot !== undefined
      ? options.projectRoot
      : `${workspace.newProjectRoot}/${options.name}`;
  if (projectRoot !== "" && !projectRoot.endsWith("/")) {
    projectRoot += "/";
  }
  const rootFilesRoot =
    options.projectRoot === undefined ? projectRoot : projectRoot + "src/";

  //TODO: add schematics for generate Requests
  const schematics: JsonObject = {};

  const project: WorkspaceProject = {
    root: projectRoot,
    projectType: "application",
    prefix: "app",
    schematics,
    architect: {
      build: {
        builder: "@ng-ally/devkit:build",
        options: {
          outputPath: `dist/${options.name}`,
          main: `${projectRoot}src/main.ts`,
          polyfills: `${projectRoot}src/polyfills.ts`,
          tsConfig: `${rootFilesRoot}tsconfig.app.json`
        },
        configurations: {
          production: {
            fileReplacements: [
              {
                replace: `${projectRoot}src/environments/environment.ts`,
                with: `${projectRoot}src/environments/environment.prod.ts`
              }
            ],
            optimization: true,
            sourceMap: false,
            outputHashing: "all",
            deleteOutputPath: true,
            extractLicenses: true,
            extractDependencies: true
          }
        }
      },
      serve: {
        builder: "@ng-ally/devkit:dev-server",
        options: {
          buildTarget: `${options.name}:build`
        },
        configurations: {
          production: {
            buildTarget: `${options.name}:build:production`
          }
        }
      }
    }
  };
  return addProjectToWorkspace(workspace, options.name, project);
}

export default function(options: ApplicationOptions): Rule {
  return (host: Tree, context: SchematicContext) => {
    if (!options.name) {
      throw new SchematicsException(`Invalid options, "name" is required.`);
    }

    const workspace = getWorkspace(host);

    let newProjectRoot = workspace.newProjectRoot;
    let appDir = `${newProjectRoot}/${options.name}`;
    let sourceRoot = `${appDir}/src`;

    let relativePathToWorkspaceRoot = appDir
      .split("/")
      .map(x => "..")
      .join("/");
    const rootInSrc = options.projectRoot !== undefined;
    if (options.projectRoot !== undefined) {
      newProjectRoot = options.projectRoot;
      appDir = `${newProjectRoot}/src`;
      sourceRoot = appDir;
      relativePathToWorkspaceRoot = relative(
        normalize("/" + sourceRoot),
        normalize("/")
      );
      if (relativePathToWorkspaceRoot === "") {
        relativePathToWorkspaceRoot = ".";
      }
    }

    return chain([
      addAppToWorkspaceFile(options, workspace),
      addDependenciesToPackageJson(),

      mergeWith(
        apply(url("./files/src"), [
          template({
            utils: strings,
            ...options,
            dot: ".",
            relativePathToWorkspaceRoot
          }),
          move(sourceRoot)
        ])
      ),

      mergeWith(
        apply(url("./files/root"), [
          template({
            utils: strings,
            ...options,
            dot: ".",
            relativePathToWorkspaceRoot,
            rootInSrc
          }),
          move(appDir)
        ])
      )
    ])(host, context);
  };
}
