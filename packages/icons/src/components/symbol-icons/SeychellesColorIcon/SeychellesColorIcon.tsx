import IconBase from '~/components/icon-base';
import type { IconProps } from '~/components/icon-base';

const SeychellesColorIcon = (props: IconProps) => (
    <IconBase xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 16 16" {...props}>
        <mask
            id="vapor-icons-color-SeychellesColorIcon__a"
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
        <g mask="url(#vapor-icons-color-SeychellesColorIcon__a)">
            <path fill="#FCD955" d="M7.269 0-3.389 16 17.973 0z" />
            <path fill="#003D88" d="M-3.39 0v16L7.27 0z" />
            <path fill="#D92223" d="M28.61 0H17.974L-3.39 16l32-10.68z" />
            <path fill="#007A39" d="M-3.39 16h32v-5.316z" />
            <path fill="#fff" d="M28.61 5.32-3.39 16l32-5.316z" />
        </g>
    </IconBase>
);
export default SeychellesColorIcon;
