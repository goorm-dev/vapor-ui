import IconBase from '~/components/icon-base';
import type { IconProps } from '~/components/icon-base';

const TunisiaColorIcon = (props: IconProps) => (
    <IconBase xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 16 16" {...props}>
        <mask
            id="vapor-icons-color-TunisiaColorIcon__a"
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
        <g mask="url(#vapor-icons-color-TunisiaColorIcon__a)">
            <path fill="#E70013" d="M20 0H-4v16h24z" />
            <path fill="#fff" d="M8 11.996a3.996 3.996 0 1 0 0-7.992 3.996 3.996 0 0 0 0 7.992" />
            <path
                fill="#E70013"
                fillRule="evenodd"
                d="M8.804 10.382a2.382 2.382 0 1 1 1.687-4.064A2.99 2.99 0 0 0 5.027 8a2.99 2.99 0 0 0 5.464 1.682 2.37 2.37 0 0 1-1.687.7"
                clipRule="evenodd"
            />
            <path
                fill="#E70013"
                fillRule="evenodd"
                d="m10.275 6.933-.773 1.062.77 1.063-1.247-.407-.772 1.064V8.4l-1.248-.405 1.248-.406.001-1.313.771 1.062z"
                clipRule="evenodd"
            />
        </g>
    </IconBase>
);
export default TunisiaColorIcon;
