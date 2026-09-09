import IconBase from '~/components/icon-base';
import type { IconProps } from '~/components/icon-base';

const PipetteIcon = (props: IconProps) => (
    <IconBase xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 16 16" {...props}>
        <path
            fill="currentColor"
            fillRule="evenodd"
            d="m11.035 2.732-1.98 1.98-.46-.46a.6.6 0 0 0-.853.844l.5.5-4.041 4.041a1.2 1.2 0 0 0-.244.352l-.735 1.618-.354.353a1 1 0 0 0 1.414 1.414l.354-.353 1.618-.735c.13-.06.25-.143.351-.244L10.647 8l.5.5a.6.6 0 0 0 .843-.853l-.46-.46 1.98-1.98a1.2 1.2 0 0 0 0-1.697l-.777-.777a1.2 1.2 0 0 0-1.698 0m-2.022 3.72.778.777L8.4 8.62l-1.165-.39z"
            clipRule="evenodd"
        />
    </IconBase>
);
export default PipetteIcon;
