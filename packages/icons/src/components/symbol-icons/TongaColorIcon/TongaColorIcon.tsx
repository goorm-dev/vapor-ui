import IconBase from '~/components/icon-base';
import type { IconProps } from '~/components/icon-base';

const TongaColorIcon = (props: IconProps) => (
    <IconBase xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 16 16" {...props}>
        <mask
            id="vapor-icons-color-TongaColorIcon__a"
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
        <g mask="url(#vapor-icons-color-TongaColorIcon__a)">
            <path fill="#C20000" d="M11.507 0v8.007H-1.809V16h32V0z" />
            <path fill="#fff" d="M11.51 0H-1.81v8.007h13.32z" />
            <path fill="#C20000" d="M5.862.995H3.836v6.018h2.026z" />
            <path fill="#C20000" d="M7.858 2.99H1.84v2.026h6.018z" />
        </g>
    </IconBase>
);
export default TongaColorIcon;
