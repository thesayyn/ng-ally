import { strings } from "@angular-devkit/core";
import {
  Rule,
  SchematicContext,
  Tree,
  apply,
  mergeWith,
  template,
  url
} from "@angular-devkit/schematics";

import { Schema as WorkspaceOptions } from "./schema";
import { latestVersions } from "../utility/latest-versions";

export default function(options: WorkspaceOptions): Rule {
  return (host: Tree, context: SchematicContext) => {
    return mergeWith(
      apply(url("./files"), [
        template({
          utils: strings,
          ...options,
          dot: ".",
          latestVersions
        })
      ])
    )(host, context);
  };
}
