import IconBase from '~/components/icon-base';
import type { IconProps } from '~/components/icon-base';

const BookmarkIcon = (props: IconProps) => (
    <IconBase xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 16 16" {...props}>
        <path
            fill="currentColor"
            d="m8 12.985-3.216 1.378q-.765.326-1.455-.124t-.689-1.273V3.031q0-.63.45-1.081t1.081-.45h7.657q.632 0 1.082.45t.45 1.081v9.935q0 .823-.69 1.273-.689.45-1.454.124z"
        />
    </IconBase>
);
export default BookmarkIcon;
