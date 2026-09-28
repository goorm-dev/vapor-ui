import IconBase from '~/components/icon-base';
import type { IconProps } from '~/components/icon-base';

const BangladeshColorIcon = (props: IconProps) => (
    <IconBase xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 16 16" {...props}>
        <mask
            id="vapor-icons-color-BangladeshColorIcon__a"
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
        <g mask="url(#vapor-icons-color-BangladeshColorIcon__a)">
            <path fill="#006A4E" d="M22.647 0H-4.02v16h26.667z" />
            <path
                fill="#F42A41"
                d="M8.013 13.242a5.242 5.242 0 1 0 0-10.484 5.242 5.242 0 0 0 0 10.484"
            />
        </g>
    </IconBase>
);
export default BangladeshColorIcon;
