import { defineConfig } from 'wxt';

export default defineConfig({
    modules: ['@wxt-dev/module-react'],
    manifest: {
        action: {},
        permissions: ['storage', 'tabs', 'sidePanel', 'scripting'],
        host_permissions: ['https://api.linear.app/*'],
        web_accessible_resources: [
            {
                resources: ['fiber-reader.js'],
                matches: ['<all_urls>'],
            },
        ],
    },
});
