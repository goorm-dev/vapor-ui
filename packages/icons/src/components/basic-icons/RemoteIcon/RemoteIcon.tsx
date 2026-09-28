import IconBase from '~/components/icon-base';
import type { IconProps } from '~/components/icon-base';

const RemoteIcon = (props: IconProps) => (
    <IconBase xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 16 16" {...props}>
        <path
            fill="currentColor"
            d="M3.833 13q-1.39 0-2.36-.972Q.5 11.056.5 9.667q0-1.32.903-2.283a3.22 3.22 0 0 1 2.205-1.05 4.4 4.4 0 0 1 1.606-2.405Q6.42 2.999 8 3q1.788 0 3.108 1.207 1.32 1.206 1.475 2.96 1.216 0 2.066.85.851.852.851 2.066 0 1.216-.85 2.066a2.8 2.8 0 0 1-2.067.851z"
        />
    </IconBase>
);
export default RemoteIcon;
