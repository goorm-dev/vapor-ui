import IconBase from '~/components/icon-base';
import type { IconProps } from '~/components/icon-base';

const HungaryColorIcon = (props: IconProps) => (
    <IconBase xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 16 16" {...props}>
        <mask
            id="vapor-icons-color-HungaryColorIcon__a"
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
        <g mask="url(#vapor-icons-color-HungaryColorIcon__a)">
            <path fill="#477050" d="M23.858 10.667h-32V16h32z" />
            <path fill="#fff" d="M23.858 5.333h-32v5.332h32z" />
            <path fill="#CE2939" d="M23.858 0h-32v5.333h32z" />
        </g>
    </IconBase>
);
export default HungaryColorIcon;
