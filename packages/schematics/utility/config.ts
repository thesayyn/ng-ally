import { SchematicsException, Tree, SchematicContext, Rule } from "@angular-devkit/schematics";
import { experimental } from "@angular-devkit/core";

export type WorkspaceSchema = experimental.workspace.WorkspaceSchema;
export type WorkspaceProject = experimental.workspace.WorkspaceProject;


export function getWorkspacePath(host: Tree): string {
  const possibleFiles = [ '/angular.json', '/.angular.json' ];
  const path = possibleFiles.filter(path => host.exists(path))[0];

  return path;
}

export function getWorkspace(host: Tree): WorkspaceSchema {
  const path = getWorkspacePath(host);
  const configBuffer = host.read(path);
  if (configBuffer === null) {
    throw new SchematicsException(`Could not find (${path})`);
  }
  const config = configBuffer.toString();

  return JSON.parse(config);
}

export function addProjectToWorkspace(
  workspace: WorkspaceSchema,
  name: string,
  project: WorkspaceProject,
): Rule {
  return (host: Tree, context: SchematicContext) => {

    if (workspace.projects[name]) {
      throw new Error(`Project '${name}' already exists in workspace.`);
    }

    // Add project to workspace.
    workspace.projects[name] = project;

    if (!workspace.defaultProject && Object.keys(workspace.projects).length === 1) {
      // Make the new project the default one.
      workspace.defaultProject = name;
    }

    host.overwrite(getWorkspacePath(host), JSON.stringify(workspace, null, 2));
  };
}