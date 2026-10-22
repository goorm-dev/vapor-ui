export const DEVICE_TYPES = {
    MOBILE: 'mobile',
    TABLET: 'tablet',
    DESKTOP: 'desktop',
} as const;

export type DeviceType = (typeof DEVICE_TYPES)[keyof typeof DEVICE_TYPES];

export const DEVICE_WIDTH_MAP: Record<DeviceType, string> = {
    [DEVICE_TYPES.MOBILE]: '368px',
    [DEVICE_TYPES.TABLET]: '768px',
    [DEVICE_TYPES.DESKTOP]: '100%',
};

export const TAB_TYPES = {
    PREVIEW: 'Preview',
    CODE: 'Code',
} as const;

export type TabType = (typeof TAB_TYPES)[keyof typeof TAB_TYPES];

export const DEFAULT_VALUES = {
    DEVICE: DEVICE_TYPES.DESKTOP,
    TAB: TAB_TYPES.PREVIEW,
} as const;
