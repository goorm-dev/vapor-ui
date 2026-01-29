import IconBase, { type IconProps } from '~/components/icon-base';

const SeychellesColorIcon = (props: IconProps) => (
    <IconBase viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
        <mask
            id="mask0_9214_1262"
            style={{ maskType: 'luminance' }}
            maskUnits="userSpaceOnUse"
            x="0"
            y="0"
            width="16"
            height="16"
        >
            <path
                d="M8 16C12.4183 16 16 12.4183 16 8C16 3.58172 12.4183 0 8 0C3.58172 0 0 3.58172 0 8C0 12.4183 3.58172 16 8 16Z"
                fill="white"
            />
        </mask>
        <g mask="url(#mask0_9214_1262)">
            <path d="M7.26904 0L-3.38916 16L17.9727 0H7.26904Z" fill="#FCD955" />
            <path d="M-3.38916 0V16L7.26904 0H-3.38916Z" fill="#003D88" />
            <path d="M28.6108 0H17.9727L-3.38916 16L28.6108 5.32V0Z" fill="#D92223" />
            <path d="M-3.38916 16H28.6108V10.6837L-3.38916 16Z" fill="#007A39" />
            <path d="M28.6108 5.32001L-3.38916 16L28.6108 10.6836V5.32001Z" fill="white" />
        </g>
    </IconBase>
);

export default SeychellesColorIcon;
