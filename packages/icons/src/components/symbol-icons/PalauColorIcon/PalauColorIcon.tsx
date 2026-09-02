import IconBase from '~/components/icon-base';
import type { IconProps } from '~/components/icon-base';

const PalauColorIcon = (props: IconProps) => (
    <IconBase xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 16 16" {...props}>
        <mask
            id="vapor-icons-color-PalauColorIcon__a"
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
        <g mask="url(#vapor-icons-color-PalauColorIcon__a)">
            <path fill="#009AFF" d="M22.427 0h-25.6v16h25.6z" />
            <path
                fill="#FF0"
                d="M12.779 8.781a4.8 4.8 0 1 0-9.476-1.538 4.8 4.8 0 0 0 9.476 1.538"
            />
        </g>
    </IconBase>
);
export default PalauColorIcon;
