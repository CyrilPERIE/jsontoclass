import { capitalizeFirstLetter } from "../utils";

export interface LanguageConfig {
  types: {
    STRING: string;
    INTEGER: string;
    FLOAT: string;
    BOOLEAN: string;
    NULL: string;
    LIST: string;
    OBJECT: string;
    DATE: string;
    ANY?: string;
  };
  imports: {
    [key: string]: string;
  };
  errorMessages: {
    INVALID_JSON: string;
    UNKNOWN_ERROR: string;
    INVALID_INPUT: string;
  };
  templates: {
    CLASS_DEFINITION: string;
    PROPERTY_TEMPLATE: string;
    CONSTRUCTOR_TEMPLATE: string;
    GETTER_TEMPLATE: string;
    SETTER_TEMPLATE: string;
  };
  formatters: {
    listType: (itemType: string) => string;
    propertyName: (name: string, useGettersSetters: boolean) => string;
    importStatements: (imports: string[]) => string;
  };
}

export const pythonConfig: LanguageConfig = {
  types: {
    STRING: 'str',
    INTEGER: 'int',
    FLOAT: 'float',
    BOOLEAN: 'bool',
    NULL: 'None',
    LIST: 'list',
    OBJECT: 'dict',
    DATE: 'datetime',
    ANY: 'Any'
  },
  imports: {
    TYPING: 'from typing import List, Dict, Optional, Any',
    DATE: 'from datetime import datetime'
  },
  errorMessages: {
    INVALID_JSON: '# Error: Invalid JSON',
    UNKNOWN_ERROR: '# An unknown error occurred',
    INVALID_INPUT: '# Error: Input must be a JSON object'
  },
  templates: {
    CLASS_DEFINITION: 'class {className}:',
    PROPERTY_TEMPLATE: '        self.{prefix}{name}: {type} = {name}',
    CONSTRUCTOR_TEMPLATE: '    def __init__(self, {parameters}):',
    GETTER_TEMPLATE: `
    @property
    def {name}(self) -> {type}:
        return self._{name}`,
    SETTER_TEMPLATE: `
    @{name}.setter
    def {name}(self, value: {type}) -> None:
        self._{name} = value`
  },
  formatters: {
    listType: (itemType) => `list[${itemType}]`,
    propertyName: (name, useGettersSetters) => useGettersSetters ? `_${name}` : name,
    importStatements: (imports) => imports.join('\n') + '\n'
  }
};

export const javaConfig: LanguageConfig = {
  types: {
    STRING: 'String',
    INTEGER: 'int',
    FLOAT: 'double',
    BOOLEAN: 'boolean',
    NULL: 'Object',
    LIST: 'List',
    OBJECT: 'Object',
    DATE: 'LocalDateTime'
  },
  imports: {
    LIST: 'import java.util.List;',
    ARRAY_LIST: 'import java.util.ArrayList;',
    DATE: 'import java.time.LocalDateTime;'
  },
  errorMessages: {
    INVALID_JSON: '// Error: Invalid JSON',
    UNKNOWN_ERROR: '// An unknown error occurred',
    INVALID_INPUT: '// Error: Input must be a JSON object'
  },
  templates: {
    CLASS_DEFINITION: 'public class {className} {',
    PROPERTY_TEMPLATE: '    private {type} {name};',
    CONSTRUCTOR_TEMPLATE: `
    public {className}() {
    }`,
    GETTER_TEMPLATE: `
    public {type} get{capitalizedName}() {
        return {name};
    }`,
    SETTER_TEMPLATE: `
    public void set{capitalizedName}({type} {name}) {
        this.{name} = {name};
    }`
  },
  formatters: {
    listType: (itemType) => `List<${itemType}>`,
    propertyName: (name) => name,
    importStatements: (imports) => imports.join('\n') + '\n\n'
  }
};

export const typescriptConfig: LanguageConfig = {
  types: {
    STRING: 'string',
    INTEGER: 'number',
    FLOAT: 'number',
    BOOLEAN: 'boolean',
    NULL: 'null',
    LIST: 'Array',
    OBJECT: 'object',
    DATE: 'Date',
    ANY: 'any'
  },
  imports: {
    DATE: ''
  },
  errorMessages: {
    INVALID_JSON: '// Error: Invalid JSON',
    UNKNOWN_ERROR: '// An unknown error occurred',
    INVALID_INPUT: '// Error: Input must be a JSON object'
  },
  templates: {
    CLASS_DEFINITION: 'export class {className} {',
    PROPERTY_TEMPLATE: '    private {prefix}{name}: {type};',
    CONSTRUCTOR_TEMPLATE: `
    constructor({parameters}) {
        {assignments}
    }`,
    GETTER_TEMPLATE: `
    public get {name}(): {type} {
        return this._{name};
    }`,
    SETTER_TEMPLATE: `
    public set {name}(value: {type}) {
        this._{name} = value;
    }`
  },
  formatters: {
    listType: (itemType) => `${itemType}[]`,
    propertyName: (name, useGettersSetters) => useGettersSetters ? `_${name}` : name,
    importStatements: (imports) => imports.filter(Boolean).join('\n') + (imports.length ? '\n\n' : '')
  }
};

export const javascriptConfig: LanguageConfig = {
  types: {
    STRING: '',
    INTEGER: '',
    FLOAT: '',
    BOOLEAN: '',
    NULL: '',
    LIST: '',
    OBJECT: '',
    DATE: '',
  },
  imports: {
    DATE: ''
  },
  errorMessages: {
    INVALID_JSON: '// Error: Invalid JSON',
    UNKNOWN_ERROR: '// An unknown error occurred',
    INVALID_INPUT: '// Error: Input must be a JSON object'
  },
  templates: {
    CLASS_DEFINITION: 'export class {className} {',
    PROPERTY_TEMPLATE: '    #{name};',
    CONSTRUCTOR_TEMPLATE: `
    constructor({parameters}) {
        {assignments}
    }`,
    GETTER_TEMPLATE: `
    get {name}() {
        return this.#{name};
    }`,
    SETTER_TEMPLATE: `
    set {name}(value) {
        this.#{name} = value;
    }`
  },
  formatters: {
    listType: () => '',
    propertyName: (name) => name,
    importStatements: () => ''
  }
};

export const goConfig: LanguageConfig = {
  types: {
    STRING: 'string',
    INTEGER: 'int',
    FLOAT: 'float64',
    BOOLEAN: 'bool',
    NULL: 'interface{}',
    LIST: '[]',
    OBJECT: 'struct',
    DATE: 'time.Time'
  },
  imports: {
    TIME: 'time',
    JSON: 'encoding/json'
  },
  errorMessages: {
    INVALID_JSON: '// Error: Invalid JSON',
    UNKNOWN_ERROR: '// An unknown error occurred',
    INVALID_INPUT: '// Error: Input must be a JSON object'
  },
  templates: {
    CLASS_DEFINITION: 'type {className} struct {',
    PROPERTY_TEMPLATE: '    {name} {type} `json:"{name}"`',
    CONSTRUCTOR_TEMPLATE: `
func New{className}() *{className} {
    return &{className}{}
}`,
    GETTER_TEMPLATE: `
func (s *{className}) Get{capitalizedName}() {type} {
    return s.{name}
}`,
    SETTER_TEMPLATE: `
func (s *{className}) Set{capitalizedName}(value {type}) {
    s.{name} = value
}`
  },
  formatters: {
    listType: (itemType) => `[]${itemType}`,
    propertyName: (name) => capitalizeFirstLetter(name),
    importStatements: (imports) => {
      if (imports.length === 0) return '';
      return 'package main\n\nimport (\n    "' + imports.join('"\n    "') + '"\n)\n\n';
    }
  }
};

export const rubyConfig: LanguageConfig = {
  types: {
    STRING: 'String',
    INTEGER: 'Integer',
    FLOAT: 'Float',
    BOOLEAN: 'Boolean',
    NULL: 'nil',
    LIST: 'Array',
    OBJECT: 'Hash',
    DATE: 'DateTime'
  },
  imports: {
    DATE: 'require "date"',
    JSON: 'require "json"'
  },
  errorMessages: {
    INVALID_JSON: '# Error: Invalid JSON',
    UNKNOWN_ERROR: '# An unknown error occurred',
    INVALID_INPUT: '# Error: Input must be a JSON object'
  },
  templates: {
    CLASS_DEFINITION: 'class {className}',
    PROPERTY_TEMPLATE: '  @{name}',
    CONSTRUCTOR_TEMPLATE: `
  def initialize({parameters})
{assignments}
  end`,
    GETTER_TEMPLATE: '  attr_reader :{name}',
    SETTER_TEMPLATE: '  attr_writer :{name}'
  },
  formatters: {
    listType: () => 'Array',
    propertyName: (name) => name.toLowerCase(),
    importStatements: (imports) => {
      if (imports.length === 0) return '';
      return imports.join('\n') + '\n\n';
    }
  }
};

export enum Language {
    PYTHON = 'python',
    JAVA = 'java',
    TYPESCRIPT = 'typescript',
    JAVASCRIPT = 'javascript',
    GO = 'go',
    RUBY = 'ruby'
}

export const LANGUAGE_CONFIGS = {
    [Language.PYTHON]: pythonConfig,
    [Language.JAVA]: javaConfig,
    [Language.TYPESCRIPT]: typescriptConfig,
    [Language.JAVASCRIPT]: javascriptConfig,
    [Language.GO]: goConfig,
    [Language.RUBY]: rubyConfig,
} as const; 