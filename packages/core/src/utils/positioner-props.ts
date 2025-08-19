// FIXME: Request a public API for useAnchorPositioning so that we can import it without referencing node_modules directly.
import type { useAnchorPositioning } from 'node_modules/@base-ui-components/react/esm/utils/useAnchorPositioning';

export type DefaultPositionerProps = useAnchorPositioning.SharedParameters;

export type Side = DefaultPositionerProps['side'];
export type Align = DefaultPositionerProps['align'];

export const defaultPositionerProps: DefaultPositionerProps = {
    collisionAvoidance: { align: 'none' },
};
