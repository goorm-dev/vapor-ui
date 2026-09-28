import IconBase from '~/components/icon-base';
import type { IconProps } from '~/components/icon-base';

const GuineaBissauColorIcon = (props: IconProps) => (
    <IconBase xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 16 16" {...props}>
        <mask
            id="vapor-icons-color-GuineaBissauColorIcon__a"
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
        <g mask="url(#vapor-icons-color-GuineaBissauColorIcon__a)">
            <path fill="#FCD116" d="M29.598 0H8.216v8h21.382z" />
            <path fill="#009E49" d="M29.598 8H8.216v8h21.382z" />
            <path fill="#CE1126" d="M-2.402 0v16h10.66V0z" />
            <path
                fill="#000"
                fillRule="evenodd"
                d="m2.927 5.364.591 1.82h1.913L3.884 8.307l.59 1.82-1.547-1.123-1.549 1.123.591-1.82L.422 7.184h1.913z"
                clipRule="evenodd"
            />
        </g>
    </IconBase>
);
export default GuineaBissauColorIcon;
