import IconBase from '~/components/icon-base';
import type { IconProps } from '~/components/icon-base';

const NamibiaColorIcon = (props: IconProps) => (
    <IconBase xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 16 16" {...props}>
        <mask
            id="vapor-icons-color-NamibiaColorIcon__a"
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
        <g mask="url(#vapor-icons-color-NamibiaColorIcon__a)">
            <path fill="#009543" d="M24 16V3.222L4.834 16z" />
            <path fill="#003580" d="M0 0v12.778L19.165 0z" />
            <path
                fill="#fff"
                d="M4.834 16 24 3.222v-.818L3.609 16zM19.165 0 0 12.778v.818L20.39 0z"
            />
            <path fill="#D21034" d="M0 16h.089L0 15.867z" />
            <path fill="#D21034" d="M20.39 0 0 13.596v2.271L.089 16h3.52L24 2.404V.133L23.91 0z" />
            <path
                fill="#FFCE00"
                d="m5.22 2.802.9-.727-.18 1.143 1.142-.18-.727.9 1.08.415-1.08.416.727.9-1.142-.18.18 1.144-.9-.728-.416 1.08-.417-1.08-.9.728.18-1.144-1.143.18.729-.9-1.08-.416 1.08-.415-.73-.9 1.144.18-.18-1.143.9.727.417-1.08z"
            />
            <path
                fill="#003580"
                d="M6.437 4.626a1.605 1.605 0 1 0-3.17-.514 1.605 1.605 0 0 0 3.17.514"
            />
            <path
                fill="#FFCE00"
                d="M5.738 5.287a1.322 1.322 0 1 0-1.87-1.87 1.322 1.322 0 0 0 1.87 1.87"
            />
        </g>
    </IconBase>
);
export default NamibiaColorIcon;
