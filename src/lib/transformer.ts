import { transform } from "./transformers/generic-transformer";
import { Language, LANGUAGE_CONFIGS } from "./transformers/language-config";

/**
 * Transforme un JSON en code dans le langage spécifié
 * @param language - Le langage cible de Language
 * @param jsonString - La chaîne JSON à transformer
 * @param useGettersSetters - Si true, génère les getters et setters
 * @returns Le code généré dans le langage cible
 */
export function transformToCode(language: string, jsonString: string, useGettersSetters: boolean = false): string {
    const config = LANGUAGE_CONFIGS[language as Language];
    if (!config) {
        return `// Error: Unsupported language: ${language}`;
    }
    return transform(jsonString, config, useGettersSetters);
}

export { Language };
