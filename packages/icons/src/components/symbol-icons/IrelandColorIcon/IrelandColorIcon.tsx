import IconBase from '~/components/icon-base';
import type { IconProps } from '~/components/icon-base';

const IrelandColorIcon = (props: IconProps) => (
    <IconBase xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 16 16" {...props}>
        <mask
            id="vapor-icons-color-IrelandColorIcon__a"
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
        <g mask="url(#vapor-icons-color-IrelandColorIcon__a)">
            <path fill="#169B62" d="M3.96 0h-7.798v16H3.96z" />
            <path fill="#FF883E" d="M19.555 0h-7.799v16h7.799z" />
            <path fill="#fff" d="M11.758 0H3.96v16h7.798z" />
        </g>
    </IconBase>
);
export default IrelandColorIcon;
