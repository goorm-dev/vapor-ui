import { STATICS_DOMAIN } from './domain';

export const OG_IMAGE_URL = `${STATICS_DOMAIN}/gds/docs/og-image/logo/og-vapor-1.png`;
export const VAPOR_LOGO_URL = `${STATICS_DOMAIN}/gds/docs/images/vapor-log.svg`;
export const VAPOR_BANNER_URL = `${STATICS_DOMAIN}/gds/docs/main/vapor-index-banner.png`;
export const NAVBAR_BLOCK_URL = `${STATICS_DOMAIN}/gds/docs/blocks/nav-bar.svg`;
export const SIDEBAR_BLOCK_URL = `${STATICS_DOMAIN}/gds/docs/blocks/side-bar.svg`;
export const FORM_BLOCK_URL = `${STATICS_DOMAIN}/gds/docs/blocks/form-card.svg`;
export const TABLE_BLOCK_URL = `${STATICS_DOMAIN}/gds/docs/blocks/table-card.svg`;

export const getComponentOgImageUrl = (componentName: string) =>
    `${STATICS_DOMAIN}/gds/docs/og-image/components/core/${componentName}.png`;
