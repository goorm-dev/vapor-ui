import IconBase from '~/components/icon-base';
import type { IconProps } from '~/components/icon-base';

const FigmaIcon = (props: IconProps) => (
    <IconBase xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 16 16" {...props}>
        <path
            fill="currentColor"
            d="M5.617 0h2.607v5.185H5.617C2.18 5.052 2.145.14 5.617 0m0 10.592h2.607V5.407H5.617c-3.472.14-3.437 5.052 0 5.185M11.054 0H8.447v5.185h2.607C14.54 5 14.495.105 11.054 0m-2.83 13.407v-2.593H5.617c-2.127 0-3.472 2.48-1.993 4.262 1.411 1.766 4.6.886 4.6-1.67M13.667 8c0-1.993-2.184-3.245-3.922-2.249-1.737.997-1.737 3.5 0 4.497S13.667 9.992 13.667 8"
        />
    </IconBase>
);
export default FigmaIcon;
