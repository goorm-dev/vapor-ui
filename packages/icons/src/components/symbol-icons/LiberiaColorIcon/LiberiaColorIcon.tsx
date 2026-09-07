import IconBase from '~/components/icon-base';
import type { IconProps } from '~/components/icon-base';

const LiberiaColorIcon = (props: IconProps) => (
    <IconBase xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 16 16" {...props}>
        <mask
            id="vapor-icons-color-LiberiaColorIcon__a"
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
        <g mask="url(#vapor-icons-color-LiberiaColorIcon__a)">
            <path
                fill="#fff"
                d="M30.4 1.455H7.264v1.454H30.4zm0 2.909H7.264v1.454H30.4zM0 7.273v1.454h30.4V7.273zm30.4 2.909H0v1.454h30.4zm0 2.908H0v1.455h30.4z"
            />
            <path
                fill="#BF0A30"
                d="M30.4 0H7.264v1.455H30.4zm0 2.91H7.264v1.454H30.4zm0 2.908H7.264v1.455H30.4zm0 2.909H0v1.455h30.4zm0 2.909H0v1.455h30.4zm0 2.91H0V16h30.4z"
            />
            <path fill="#002868" d="M7.264 5.818V0H0v7.273h7.264z" />
            <path
                fill="#fff"
                fillRule="evenodd"
                d="m3.76 1.702.458 1.413h1.486l-1.202.872.46 1.413-1.202-.873-1.202.873.458-1.413-1.2-.872H3.3z"
                clipRule="evenodd"
            />
        </g>
    </IconBase>
);
export default LiberiaColorIcon;
