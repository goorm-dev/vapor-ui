export {
    loadConfig,
    findConfigFile,
    defineConfig,
    getComponentConfig,
    type LoadConfigOptions,
    type LoadConfigResult,
} from './loader';
export {
    ExtractorConfigSchema,
    GlobalConfigSchema,
    ComponentConfigSchema,
    type ExtractorConfig,
    type ExtractorConfigInput,
    type GlobalConfig,
    type ComponentConfig,
} from './schema';
export { DEFAULT_CONFIG, CONFIG_FILE_NAMES } from './defaults';
