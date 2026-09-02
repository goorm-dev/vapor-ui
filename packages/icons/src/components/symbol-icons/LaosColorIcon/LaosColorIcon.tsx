import IconBase from '~/components/icon-base';
import type { IconProps } from '~/components/icon-base';

const LaosColorIcon = (props: IconProps) => (
    <IconBase xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 16 16" {...props}>
        <mask
            id="vapor-icons-color-LaosColorIcon__a"
            width={16}
            height={16}
            x={0}
            y={0}
            maskUnits="userSpaceOnUse"
            style={{
                maskType: 'luminance',
            }}
        >
            <path fill="#fff" d="M8 16A8 8 0 1 0 8 0a8 8 0 0 0 0 16" />
        </mask>
        <g mask="url(#vapor-icons-color-LaosColorIcon__a)">
            <path fill="#CF0921" d="M20 12.05H-4V16h24zM20 0H-4v3.95h24z" />
            <path fill="#002368" d="M20 3.95H-4v8.1h24z" />
            <path fill="#fff" d="M8 11.206a3.206 3.206 0 1 0 0-6.412 3.206 3.206 0 0 0 0 6.412" />
        </g>
    </IconBase>
);
export default LaosColorIcon;
