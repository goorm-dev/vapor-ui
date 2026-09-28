import IconBase from '~/components/icon-base';
import type { IconProps } from '~/components/icon-base';

const BurkinaFasoColorIcon = (props: IconProps) => (
    <IconBase xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 16 16" {...props}>
        <mask
            id="vapor-icons-color-BurkinaFasoColorIcon__a"
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
        <g mask="url(#vapor-icons-color-BurkinaFasoColorIcon__a)">
            <path fill="#EF2B2D" d="M22.39-1.593H-6.39V8h28.78z" />
            <path fill="#009E49" d="M22.39 8H-6.39v9.593h28.78z" />
            <path
                fill="#FCD116"
                fillRule="evenodd"
                d="m8 4.835.71 2.183h2.295l-1.858 1.35.711 2.183L8 9.201l-1.858 1.35.71-2.184-1.857-1.349H7.29z"
                clipRule="evenodd"
            />
        </g>
    </IconBase>
);
export default BurkinaFasoColorIcon;
