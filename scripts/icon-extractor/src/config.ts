/**
 * Typed view of `icon-extractor.config.json` — which Figma file and frames feed each icon type,
 * and where in `@vapor-ui/icons` the generated components land.
 */
import config from '../icon-extractor.config.json' with { type: 'json' };

/** A top-level Figma frame whose direct COMPONENT children are icons. */
type Frame = {
    id: string;
    name: string;
    /** Colour icons keep Figma's palette; everything else follows `currentColor`. */
    color?: boolean;
};

type IconTypeConfig = {
    frames: Frame[];
    /** Repo-relative directory the components are written to. */
    targetPath: string;
};

type IconType = keyof typeof config.iconTypes;

const figma: { fileKey: string } = config.figma;
const iconTypes: Record<IconType, IconTypeConfig> = config.iconTypes;
const ICON_TYPE_NAMES = Object.keys(iconTypes) as IconType[];

const isIconType = (value: string | undefined): value is IconType =>
    value !== undefined && Object.hasOwn(iconTypes, value);

/** Frame ids whose icons are colour icons, for `parentId` lookups. */
const colorFrameIds = ({ frames }: IconTypeConfig) =>
    new Set(frames.filter((frame) => frame.color).map((frame) => frame.id));

export type { Frame, IconType, IconTypeConfig };
export { ICON_TYPE_NAMES, colorFrameIds, figma, iconTypes, isIconType };
