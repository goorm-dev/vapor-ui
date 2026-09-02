import IconBase from '~/components/icon-base';
import type { IconProps } from '~/components/icon-base';

const EastTimorColorIcon = (props: IconProps) => (
    <IconBase xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 16 16" {...props}>
        <mask
            id="vapor-icons-color-EastTimorColorIcon__a"
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
        <g mask="url(#vapor-icons-color-EastTimorColorIcon__a)">
            <path fill="#DD1F19" d="m-1.08 0 15.735 8-15.735 8h32V0z" />
            <path fill="#FFC821" d="M-1.08 0 9.415 8-1.08 16l15.735-8z" />
            <path fill="#000" d="M-1.08 0v16L9.415 8z" />
            <path
                fill="#fff"
                fillRule="evenodd"
                d="m4.65 9.124-1.794-.386-.921 1.586L1.747 8.5l-1.792-.387 1.678-.742-.188-1.824L2.67 6.913l1.676-.74-.92 1.585z"
                clipRule="evenodd"
            />
        </g>
    </IconBase>
);
export default EastTimorColorIcon;
