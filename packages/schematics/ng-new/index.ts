import {
    Rule,
    SchematicContext,
    SchematicsException,
    Tree,
    apply,
    chain,
    empty,
    mergeWith,
    move,
    schematic,
  } from '@angular-devkit/schematics';
  import {
    NodePackageInstallTask,
    NodePackageLinkTask,
    RepositoryInitializerTask,
  } from '@angular-devkit/schematics/tasks';
  import { Schema as ApplicationOptions } from '../application/schema';
  import { Schema as WorkspaceOptions } from '../workspace/schema';
  import { Schema as NgNewOptions } from './schema';
  
  
  export default function (options: NgNewOptions): Rule {
    if (!options.name) {
      throw new SchematicsException(`Invalid options, "name" is required.`);
    }
  
    if (!options.directory) {
      options.directory = options.name;
    }
  
    const workspaceOptions: WorkspaceOptions = {
      name: options.name,
      version: options.version
    };
    const applicationOptions: ApplicationOptions = {
      projectRoot: '',
      name: options.name
    };
  
    return chain([
      mergeWith(
        apply(empty(), [
          schematic('workspace', workspaceOptions),
          schematic('application', applicationOptions),
          move(options.directory || options.name),
        ]),
      ),
      (host: Tree, context: SchematicContext) => {
        context.addTask(new NodePackageInstallTask(options.directory));
      },
    ]);
  }