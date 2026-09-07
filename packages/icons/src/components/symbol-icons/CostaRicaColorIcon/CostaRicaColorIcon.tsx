import IconBase from '~/components/icon-base';
import type { IconProps } from '~/components/icon-base';

const CostaRicaColorIcon = (props: IconProps) => (
    <IconBase xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 16 16" {...props}>
        <mask
            id="vapor-icons-color-CostaRicaColorIcon__a"
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
        <g mask="url(#vapor-icons-color-CostaRicaColorIcon__a)">
            <path fill="#002B7F" d="M21.335 0H-5.334v2.573h26.667zm0 13.427H-5.334V16h26.667z" />
            <path
                fill="#fff"
                d="M21.335 10.764H-5.334v2.663h26.667zm0-8.191H-5.334v2.663h26.667z"
            />
            <path fill="#CE1126" d="M21.335 5.236H-5.334v5.528h26.667z" />
        </g>
    </IconBase>
);
export default CostaRicaColorIcon;
