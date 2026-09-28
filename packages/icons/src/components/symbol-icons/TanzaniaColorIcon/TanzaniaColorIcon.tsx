import IconBase from '~/components/icon-base';
import type { IconProps } from '~/components/icon-base';

const TanzaniaColorIcon = (props: IconProps) => (
    <IconBase xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 16 16" {...props}>
        <mask
            id="vapor-icons-color-TanzaniaColorIcon__a"
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
        <g mask="url(#vapor-icons-color-TanzaniaColorIcon__a)">
            <path fill="#1EB53A" d="M-4 0v12.227L14.305 0z" />
            <path
                fill="#FCD116"
                d="M14.305 0-4 12.227v1.182L16.075 0zM20 2.65.015 16h1.723L20 3.802z"
            />
            <path fill="#00A3DD" d="M20 3.802 1.738 16H20z" />
            <path fill="#000" d="M20 0h-3.925L-4 13.41V16H.015L20 2.65z" />
        </g>
    </IconBase>
);
export default TanzaniaColorIcon;
