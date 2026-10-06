import type { ComponentNode } from '@figma/rest-api-spec';

/** A COMPONENT node tagged with the frame it was found under. */
type IconNode = ComponentNode & { parentId: string };
type IconNodeWithUrl = IconNode & { url: string };

export type { IconNode, IconNodeWithUrl };
