import IconBase from '~/components/icon-base';
import type { IconProps } from '~/components/icon-base';

const NigeriaColorIcon = (props: IconProps) => (
    <IconBase xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 16 16" {...props}>
        <mask
            id="vapor-icons-color-NigeriaColorIcon__a"
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
        <g mask="url(#vapor-icons-color-NigeriaColorIcon__a)">
            <path fill="#008850" d="M3.915 0h-8.171v16h8.17z" />
            <path fill="#fff" d="M12.085 0h-8.17v16h8.17z" />
            <path fill="#008850" d="M20.256 0h-8.17v16h8.17z" />
        </g>
    </IconBase>
);
export default NigeriaColorIcon;
