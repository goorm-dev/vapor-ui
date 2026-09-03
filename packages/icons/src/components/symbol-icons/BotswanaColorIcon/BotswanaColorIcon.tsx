import IconBase from '~/components/icon-base';
import type { IconProps } from '~/components/icon-base';

const BotswanaColorIcon = (props: IconProps) => (
    <IconBase xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 16 16" {...props}>
        <mask
            id="vapor-icons-color-BotswanaColorIcon__a"
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
        <g mask="url(#vapor-icons-color-BotswanaColorIcon__a)">
            <path fill="#6DA9D2" d="M20 10.01H-4V16h24zM20 0H-4v5.99h24z" />
            <path fill="#fff" d="M20 5.99H-4v.66h24zm0 3.36H-4v.66h24z" />
            <path fill="#000" d="M20 6.65H-4v2.7h24z" />
        </g>
    </IconBase>
);
export default BotswanaColorIcon;
