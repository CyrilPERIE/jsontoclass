/**
 * Type représentant une valeur JSON valide
 */
export type JsonValue =
  | string
  | number
  | boolean
  | null
  | JsonValue[]
  | { [key: string]: JsonValue };

/**
 * Interface représentant un objet JSON
 */
export interface JsonObject {
  [key: string]: JsonValue;
}

/**
 * Détermine le type d'une valeur JSON pour la génération de code
 * @param value - La valeur JSON à analyser
 * @param objectName - Le nom de l'objet (optionnel, pour les objets imbriqués)
 * @returns Le type correspondant dans le langage cible
 */
export function getTypeName(value: JsonValue, objectName?: string): string {
  if (value === null) return "None";
  if (Array.isArray(value)) {
    if (value.length === 0) return "list";
    return `list[${getTypeName(value[0])}]`;
  }
  if (typeof value === "object") {
    return objectName || "dict";
  }
  if (typeof value === "string" && isDateString(value)) {
    return "datetime";
  }

  const typeMap: Record<string, string> = {
    string: "str",
    number:
      typeof value === "number" && Number.isInteger(value) ? "int" : "float",
    boolean: "bool",
  };
  return typeMap[typeof value] || "Any";
}

/**
 * Met en majuscule la première lettre d'une chaîne
 * @param str - La chaîne à transformer
 * @returns La chaîne avec la première lettre en majuscule
 */
export function capitalizeFirstLetter(str: string): string {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

/**
 * Génère les getters et setters pour une propriété
 * @param key - Le nom de la propriété
 * @param typeName - Le type de la propriété
 * @returns Le code des getters et setters
 */
export function generateGettersSetters(key: string, typeName: string): string {
  return `
      @property
      def ${key}(self) -> ${typeName}:
          return self._${key}
  
      @${key}.setter
      def ${key}(self, value: ${typeName}) -> None:
          self._${key} = value`;
}

/**
 * Génère une classe à partir d'un objet JSON
 * @param className - Le nom de la classe à générer
 * @param json - L'objet JSON source
 * @param useGettersSetters - Si true, génère les getters et setters
 * @returns Le code de la classe générée
 */
export function generateClass(
  className: string,
  json: JsonObject,
  useGettersSetters: boolean
): string {
  // Collecter les types utilisés
  const types = new Set<string>();

  Object.values(json).forEach((value) => {
    if (typeof value === "string" && isDateString(value)) {
      types.add("datetime");
    }
  });

  // Générer les imports nécessaires
  const imports: string[] = [];

  const properties = Object.entries(json)
    .map(([key, value]) => {
      const isObject =
        value && typeof value === "object" && !Array.isArray(value);
      const typeName = getTypeName(
        value,
        isObject ? capitalizeFirstLetter(key) : undefined
      );
      const prefix = useGettersSetters ? "_" : "";
      return `        self.${prefix}${key}: ${typeName} = ${key}`;
    })
    .join("\n");

  const parameters = Object.entries(json)
    .map(([key, value]) => {
      const isObject =
        value && typeof value === "object" && !Array.isArray(value);
      const typeName = getTypeName(
        value,
        isObject ? capitalizeFirstLetter(key) : undefined
      );
      return `${key}: ${typeName}`;
    })
    .join(", ");

  const gettersSetters = useGettersSetters
    ? Object.entries(json)
        .map(([key, value]) => {
          const isObject =
            value && typeof value === "object" && !Array.isArray(value);
          const typeName = getTypeName(
            value,
            isObject ? capitalizeFirstLetter(key) : undefined
          );
          return generateGettersSetters(key, typeName);
        })
        .join("\n")
    : "";

  const classDefinition = `class ${className}:
      def __init__(self, ${parameters}):
  ${properties}
  ${gettersSetters}`;

  return [...imports, classDefinition].join("\n\n");
}

/**
 * Trouve tous les objets imbriqués dans un objet JSON
 * @param json - L'objet JSON à analyser
 * @returns Une Map des objets imbriqués avec leurs noms de classe
 */
export function findNestedObjects(json: JsonObject): Map<string, JsonObject> {
  const objects = new Map<string, JsonObject>();

  function explore(obj: JsonObject) {
    for (const [key, value] of Object.entries(obj)) {
      if (value && typeof value === "object" && !Array.isArray(value)) {
        const className = capitalizeFirstLetter(key);
        objects.set(className, value as JsonObject);
        explore(value as JsonObject);
      }
    }
  }

  explore(json);
  return objects;
}

/**
 * Vérifie si une chaîne représente une date valide
 * @param value - La chaîne à vérifier
 * @returns true si la chaîne est une date valide, false sinon
 */
export function isDateString(value: string): boolean {
  // Vérifie les formats de date courants
  const datePatterns = [
    /^\d{4}-\d{2}-\d{2}$/, // YYYY-MM-DD
    /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/, // YYYY-MM-DDThh:mm:ss
    /^\d{4}\/\d{2}\/\d{2}$/, // YYYY/MM/DD
    /^\d{2}\/\d{2}\/\d{4}$/, // DD/MM/YYYY
    /^\d{2}-\d{2}-\d{4}$/, // DD-MM-YYYY
  ];

  if (typeof value !== "string") return false;

  // Vérifie si la chaîne correspond à un des patterns
  if (!datePatterns.some((pattern) => pattern.test(value))) return false;

  // Vérifie si c'est une date valide
  const date = new Date(value);
  return date instanceof Date && !isNaN(date.getTime());
}
