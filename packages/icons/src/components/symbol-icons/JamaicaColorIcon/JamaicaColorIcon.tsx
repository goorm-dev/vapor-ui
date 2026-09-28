import IconBase from '~/components/icon-base';
import type { IconProps } from '~/components/icon-base';

const JamaicaColorIcon = (props: IconProps) => (
    <IconBase xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 16 16" {...props}>
        <mask
            id="vapor-icons-color-JamaicaColorIcon__a"
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
        <g fillRule="evenodd" clipRule="evenodd" mask="url(#vapor-icons-color-JamaicaColorIcon__a)">
            <path fill="#2D2926" d="M-8 14.51 4.915 8.05-8 1.594zm32 0V1.592L11.085 8.05z" />
            <path fill="#007749" d="M8 6.51 21.018 0H-5.018zM-4.813 16h25.626L8 9.593z" />
            <path
                fill="#FFB81C"
                d="M8 6.51-5.018 0H-8v1.593L4.915 8.05-8 14.509V16h3.187L8 9.593 20.813 16H24v-1.49L11.085 8.05 24 1.594V0h-2.982z"
            />
        </g>
    </IconBase>
);
export default JamaicaColorIcon;
