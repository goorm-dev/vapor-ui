import IconBase from '~/components/icon-base';
import type { IconProps } from '~/components/icon-base';

const SenegalColorIcon = (props: IconProps) => (
    <IconBase xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 16 16" {...props}>
        <mask
            id="vapor-icons-color-SenegalColorIcon__a"
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
        <g mask="url(#vapor-icons-color-SenegalColorIcon__a)">
            <path fill="#00853F" d="M4 0h-8v16h8z" />
            <path fill="#FDEF42" d="M12 0H4v16h8z" />
            <path fill="#E31B23" d="M20 0h-8v16h8z" />
            <path
                fill="#00853F"
                fillRule="evenodd"
                d="m8 5.364.59 1.818h1.912L8.956 8.305l.591 1.819L8 9l-1.546 1.124.59-1.819-1.546-1.123H7.41z"
                clipRule="evenodd"
            />
        </g>
    </IconBase>
);
export default SenegalColorIcon;
