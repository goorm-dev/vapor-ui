import IconBase from '~/components/icon-base';
import type { IconProps } from '~/components/icon-base';

const DotIcon = (props: IconProps) => (
    <IconBase xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 16 16" {...props}>
        <circle cx={8} cy={8} r={4} fill="currentColor" />
    </IconBase>
);
export default DotIcon;
