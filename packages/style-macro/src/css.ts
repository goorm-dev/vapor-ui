import type { StyleObject } from '~/types';

let warned = false;

export function css(_styles: StyleObject) {
    if (!warned) {
        console.warn(
            '[@vapor-ui/style-macro] css() was called but the plugin is not active. ' +
                'Register the appropriate bundler entry (@vapor-ui/style-macro/vite, /webpack, /next, ...) in your build config.',
        );
        warned = true;
    }
    return '';
}
