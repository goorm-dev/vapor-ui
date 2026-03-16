import corePackage from '../../../../packages/core/package.json' with { type: 'json' };

// The docs site represents the published Vapor UI package version, which tracks @vapor-ui/core.
export const appVersion = corePackage.version;

export async function getAppVersion() {
    return appVersion;
}
