import path from 'node:path';

export interface PathResolverOptions {
    outputDir: string;
    languages: string[];
    defaultLanguage: string;
}

export function resolveOutputPath(
    fileName: string,
    lang: string,
    options: PathResolverOptions,
): string {
    return path.join(options.outputDir, lang, fileName);
}

export function resolveAllLanguagePaths(
    fileName: string,
    options: PathResolverOptions,
): Map<string, string> {
    const paths = new Map<string, string>();

    for (const lang of options.languages) {
        paths.set(lang, resolveOutputPath(fileName, lang, options));
    }

    return paths;
}

export function getTargetLanguages(
    langOption: string | undefined,
    config: PathResolverOptions,
): string[] {
    // No language specified - use default
    if (!langOption) {
        return [config.defaultLanguage];
    }

    // 'all' - use all configured languages
    if (langOption === 'all') {
        return config.languages;
    }

    // Explicit language specified - use it (CLI override takes precedence)
    return [langOption];
}
