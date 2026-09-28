import IconBase from '~/components/icon-base';
import type { IconProps } from '~/components/icon-base';

const ComorosColorIcon = (props: IconProps) => (
    <IconBase xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 16 16" {...props}>
        <mask
            id="vapor-icons-color-ComorosColorIcon__a"
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
        <g mask="url(#vapor-icons-color-ComorosColorIcon__a)">
            <path fill="#FFD100" d="m0 0 6.658 4h20.01V0z" />
            <path fill="#fff" d="M13.318 8h13.35V4H6.657z" />
            <path fill="#EF3340" d="M6.658 12h20.01V8h-13.35z" />
            <path fill="#003DA5" d="M0 16h26.667v-4H6.658z" />
            <path fill="#009639" d="m13.318 8-6.66-4L0 0v16l6.658-4z" />
            <path
                fill="#fff"
                fillRule="evenodd"
                d="M2.293 8c0-1.85 1.405-3.384 3.243-3.66a3.787 3.787 0 1 0 0 7.324c-1.838-.278-3.243-1.811-3.243-3.66z"
                clipRule="evenodd"
            />
            <path
                fill="#fff"
                fillRule="evenodd"
                d="m5.57 4.79.168.523h.55l-.444.323.169.522-.444-.323-.445.323.17-.522-.445-.323h.55zm0 1.674.168.521h.55l-.444.324.169.522-.444-.322-.445.322.17-.522-.445-.324h.55zm0 1.672.168.524h.55l-.444.322.169.523-.444-.323-.445.323.17-.523-.445-.322h.55zm0 1.674.168.523h.55l-.444.323.169.522-.444-.324-.445.324.17-.522-.445-.323h.55z"
                clipRule="evenodd"
            />
        </g>
    </IconBase>
);
export default ComorosColorIcon;
