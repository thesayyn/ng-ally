export interface Schema {
    /**
     * The name of the module.
     */
    name: string;
    /**
     * The path to create the module.
     */
    path?: string;
    /**
     * The name of the project.
     */
    project?: string;
    /**
     * Generates a routing module.
     */
    routing?: boolean;
    /**
     * The scope for the generated routing.
     */
    routingScope?: ("Child" | "Root");
    /**
     * Flag to indicate if a dir is created.
     */
    flat?: boolean;
    /**
     * Allows specification of the declaring module.
     */
    module?: string;
  }
  