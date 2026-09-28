import IconBase from '~/components/icon-base';
import type { IconProps } from '~/components/icon-base';

const GuineaColorIcon = (props: IconProps) => (
    <IconBase xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 16 16" {...props}>
        <mask
            id="vapor-icons-color-GuineaColorIcon__a"
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
        <g mask="url(#vapor-icons-color-GuineaColorIcon__a)">
            <path fill="#CF0921" d="M4 0h-8v16h8z" />
            <path fill="#FCD20F" d="M12 0H4v16h8z" />
            <path fill="#009560" d="M20 0h-8v16h8z" />
        </g>
    </IconBase>
);
export default GuineaColorIcon;
