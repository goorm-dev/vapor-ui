import IconBase from '~/components/icon-base';
import type { IconProps } from '~/components/icon-base';

const MarshallIslandsColorIcon = (props: IconProps) => (
    <IconBase xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 16 16" {...props}>
        <mask
            id="vapor-icons-color-MarshallIslandsColorIcon__a"
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
        <g mask="url(#vapor-icons-color-MarshallIslandsColorIcon__a)">
            <path
                fill="#003594"
                d="M28.136 0h-30.4v15.238L28.136.262zm-30.4 16h30.4V6.538l-30.4 9.22z"
            />
            <path fill="#DE7600" d="m28.136.262-30.4 14.976v.253L28.136 3.4z" />
            <path
                fill="#fff"
                d="M-2.264 15.49v.268l30.4-9.22V3.4zM3.578.945l.233 3.139.687-1.67-.24 1.79 1.097-1.435-.695 1.667 1.43-1.103-1.103 1.43 1.668-.694-1.437 1.096 1.791-.24-1.67.688 3.12.23-3.12.233 1.67.688-1.79-.24L6.654 7.62l-1.668-.695 1.102 1.43L4.66 7.253l.695 1.667-1.097-1.435.24 1.79-.687-1.67-.233 3.119-.23-3.119-.688 1.67.24-1.79L1.804 8.92l.694-1.667-1.43 1.102 1.103-1.43-1.667.695 1.434-1.096-1.789.24 1.67-.688-3.12-.232 3.12-.231-1.67-.688 1.79.24L.503 4.07l1.667.695-1.104-1.431 1.431 1.103-.694-1.667L2.9 4.204l-.24-1.79.687 1.67z"
            />
        </g>
    </IconBase>
);
export default MarshallIslandsColorIcon;
