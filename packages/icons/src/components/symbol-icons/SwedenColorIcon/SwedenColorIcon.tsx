import IconBase from '~/components/icon-base';
import type { IconProps } from '~/components/icon-base';

const SwedenColorIcon = (props: IconProps) => (
    <IconBase xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 16 16" {...props}>
        <mask
            id="vapor-icons-color-SwedenColorIcon__a"
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
        <g mask="url(#vapor-icons-color-SwedenColorIcon__a)">
            <path
                fill="#006AA7"
                d="M4.758 9.59h-7.98V16h7.98zm0-9.59h-7.98v6.41h7.98zm17.62 9.59H7.937V16h14.441zm0-9.59H7.936v6.41h14.442z"
            />
            <path
                fill="#FECC00"
                d="M7.937 0H4.758v6.41h-7.98v3.18h7.98V16h3.179V9.59h14.441V6.41H7.937z"
            />
        </g>
    </IconBase>
);
export default SwedenColorIcon;
