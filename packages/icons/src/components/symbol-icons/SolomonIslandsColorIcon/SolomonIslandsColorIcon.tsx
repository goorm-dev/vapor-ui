import IconBase from '~/components/icon-base';
import type { IconProps } from '~/components/icon-base';

const SolomonIslandsColorIcon = (props: IconProps) => (
    <IconBase xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 16 16" {...props}>
        <mask
            id="vapor-icons-color-SolomonIslandsColorIcon__a"
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
        <g mask="url(#vapor-icons-color-SolomonIslandsColorIcon__a)">
            <path fill="#1B5B30" d="M29.802 16V.807L-.543 16z" />
            <path fill="#FCD20F" d="M-2.198 15.193V16h1.654L29.802.807V0H28.21z" />
            <path fill="#0050BB" d="M-2.198 15.193 28.21 0H-2.2z" />
            <path
                fill="#fff"
                d="M.576 1.607.233.545l-.346 1.062h-1.116l.904.657-.346 1.06.904-.655.902.655-.344-1.06.902-.657zm0 5.423L.233 5.97l-.346 1.06h-1.116l.904.657-.346 1.062.904-.656.902.656L.79 7.687l.902-.656zm3.161-2.712-.344-1.06-.345 1.06H1.93l.904.657-.346 1.061.904-.656.902.656-.344-1.061.902-.657zm3.161-2.711L6.553.545l-.346 1.062H5.091l.904.657-.346 1.06.904-.655.903.655-.345-1.06.904-.657zm0 5.423-.345-1.06-.346 1.06H5.091l.904.657-.346 1.062.904-.656.903.656-.345-1.062.903-.656z"
            />
        </g>
    </IconBase>
);
export default SolomonIslandsColorIcon;
