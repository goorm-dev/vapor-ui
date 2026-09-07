import IconBase from '~/components/icon-base';
import type { IconProps } from '~/components/icon-base';

const VietnamColorIcon = (props: IconProps) => (
    <IconBase xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 16 16" {...props}>
        <mask
            id="vapor-icons-color-VietnamColorIcon__a"
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
        <g mask="url(#vapor-icons-color-VietnamColorIcon__a)">
            <path fill="#DA251D" d="M20 0H-4v16h24z" />
            <path
                fill="#FF0"
                d="m8.015 3.12 1.087 3.344h3.514L9.773 8.529l1.085 3.342-2.843-2.066-2.842 2.066 1.085-3.342-2.843-2.065h3.514z"
            />
        </g>
    </IconBase>
);
export default VietnamColorIcon;
