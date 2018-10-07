import {
  apply,
  chain,
  empty,
  mergeWith,
  move,
  Rule,
  schematic,
  SchematicContext,
  SchematicsException,
  Tree
} from "@angular-devkit/schematics";
import { NodePackageInstallTask, RepositoryInitializerTask } from "@angular-devkit/schematics/tasks";
import { Schema as ApplicationOptions } from "../application/schema";
import { Schema as WorkspaceOptions } from "../workspace/schema";
import { Schema as NgNewOptions } from "./schema";

export default function(options: NgNewOptions): Rule {
  if (!options.name) {
    throw new SchematicsException(`Invalid options, "name" is required.`);
  }

  if (!options.directory) {
    options.directory = options.name;
  }

  const workspaceOptions: WorkspaceOptions = {
    name: options.name
  };

  const applicationOptions: ApplicationOptions = {
    projectRoot: "",
    name: options.name
  };

  return chain([
    mergeWith(
      apply(empty(), [
        schematic("workspace", workspaceOptions),
        schematic("application", applicationOptions),
        move(options.directory)
      ])
    ),
    (host: Tree, context: SchematicContext) => {
      let packageTask;
      if ( ! options.skipInstall ) {
        packageTask = new NodePackageInstallTask(options.directory);
      }
      if (!options.skipGit) {
        const commit = typeof options.commit == 'object'
          ? options.commit
          : (!!options.commit ? {} : false);

        context.addTask(
          new RepositoryInitializerTask(
            options.directory,
            commit,
          ),
          packageTask ? [packageTask] : [],
        );
      }
    }
  ]);
}
