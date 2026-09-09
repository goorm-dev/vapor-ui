import IconBase from '~/components/icon-base';
import type { IconProps } from '~/components/icon-base';

const GuyanaColorIcon = (props: IconProps) => (
    <IconBase xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 16 16" {...props}>
        <mask
            id="vapor-icons-color-GuyanaColorIcon__a"
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
        <g mask="url(#vapor-icons-color-GuyanaColorIcon__a)">
            <path fill="#009F47" d="M24.104 0H-2.564v16h26.668z" />
            <path fill="#fff" d="m-2.564 16 26.668-7.958L-2.564 0z" />
            <path fill="#FCD20F" d="m-2.564 15.356 24.28-7.314L-2.564.644z" />
            <path fill="#000" d="m-2.564 16 13.262-7.955L-2.564 0z" />
            <path
                fill="#CF0921"
                fillRule="evenodd"
                d="m-2.564 15.106 11.762-7.06L-2.564.915z"
                clipRule="evenodd"
            />
        </g>
    </IconBase>
);
export default GuyanaColorIcon;
