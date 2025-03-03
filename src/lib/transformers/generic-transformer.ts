import { JsonObject, JsonValue, findNestedObjects, isDateString, capitalizeFirstLetter } from "../utils";
import { LanguageConfig, rubyConfig } from "./language-config";

function getType(value: JsonValue, config: LanguageConfig, objectName?: string): string {
  if (value === null) return config.types.NULL;
  if (Array.isArray(value)) {
    if (value.length === 0) return config.formatters.listType(config.types.OBJECT);
    return config.formatters.listType(getType(value[0], config, objectName));
  }
  if (typeof value === 'object') {
    return objectName || config.types.OBJECT;
  }
  if (typeof value === 'string' && isDateString(value)) {
    return config.types.DATE;
  }
  
  const typeMap: Record<string, string> = {
    'string': config.types.STRING,
    'number': Number.isInteger(value) ? config.types.INTEGER : config.types.FLOAT,
    'boolean': config.types.BOOLEAN
  };
  return typeMap[typeof value] || config.types.OBJECT;
}

function generateGettersSetters(key: string, type: string, config: LanguageConfig): string {
  const capitalizedKey = capitalizeFirstLetter(key);
  return config.templates.GETTER_TEMPLATE
    .replace(/{type}/g, type)
    .replace(/{capitalizedName}/g, capitalizedKey)
    .replace(/{name}/g, key) +
  config.templates.SETTER_TEMPLATE
    .replace(/{type}/g, type)
    .replace(/{capitalizedName}/g, capitalizedKey)
    .replace(/{name}/g, key);
}

function generateClass(
  className: string, 
  json: JsonObject, 
  config: LanguageConfig,
  useGettersSetters: boolean
): string {
  const requiredImports = new Set<string>();
  
  if (Object.values(json).some(value => typeof value === 'string' && isDateString(value))) {
    requiredImports.add(config.imports.DATE);
  }
  if (Object.values(json).some(value => Array.isArray(value))) {
    requiredImports.add(config.imports.LIST);
  }

  const properties = Object.entries(json)
    .map(([key, value]) => {
      const type = getType(value, config, typeof value === 'object' ? capitalizeFirstLetter(key) : undefined);
      const name = config.formatters.propertyName(key, useGettersSetters);
      return config.templates.PROPERTY_TEMPLATE
        .replace(/{type}/g, type)
        .replace(/{name}/g, key)
        .replace(/{prefix}/g, useGettersSetters ? '_' : '');
    })
    .join('\n');

  const gettersSetters = useGettersSetters
    ? Object.keys(json)
        .map(key => {
          if (config === rubyConfig) {
            return `  attr_accessor :${key.toLowerCase()}`;
          }
          return generateGettersSetters(key, getType(json[key], config), config);
        })
        .join('\n')
    : '';

  const classDefinition = config.templates.CLASS_DEFINITION.replace('{className}', className);
  
  if (config === rubyConfig && useGettersSetters) {
    return config.formatters.importStatements([...requiredImports]) +
      classDefinition + '\n' +
      gettersSetters + '\n' +
      properties + '\n' +
      'end';
  }

  return config.formatters.importStatements([...requiredImports]) +
    classDefinition + '\n' +
    properties + '\n' +
    (useGettersSetters ? gettersSetters + '\n' : '') +
    (config === rubyConfig ? 'end' : '}');
}

export function transform(
  jsonString: string,
  config: LanguageConfig,
  useGettersSetters: boolean = false
): string {
  try {
    const jsonData = JSON.parse(jsonString);
    if (typeof jsonData !== 'object' || jsonData === null || Array.isArray(jsonData)) {
      throw new Error(config.errorMessages.INVALID_INPUT);
    }

    const nestedObjects = findNestedObjects(jsonData);
    const classes: string[] = [];

    for (const [className, objectData] of nestedObjects) {
      classes.push(generateClass(className, objectData, config, useGettersSetters));
    }

    classes.push(generateClass('MainClass', jsonData, config, useGettersSetters));

    return classes.join('\n\n');
  } catch (error) {
    if (error instanceof Error) {
      return error.message;
    }
    return config.errorMessages.UNKNOWN_ERROR;
  }
} 