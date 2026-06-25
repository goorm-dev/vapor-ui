import { defineConfig } from 'wxt';

export default defineConfig({
    modules: ['@wxt-dev/module-react'],
    manifest: {
        action: {},
        permissions: ['storage', 'tabs', 'sidePanel', 'scripting'],
        host_permissions: ['https://api.linear.app/*'],
        // fiber-reader는 MAIN world에서 fiber expando를 읽으므로 주입 가능해야 한다.
        web_accessible_resources: [{ resources: ['fiber-reader.js'], matches: ['<all_urls>'] }],
    },
});
