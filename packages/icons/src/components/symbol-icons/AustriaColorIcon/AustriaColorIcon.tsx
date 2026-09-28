import IconBase from '~/components/icon-base';
import type { IconProps } from '~/components/icon-base';

const AustriaColorIcon = (props: IconProps) => (
    <IconBase xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 16 16" {...props}>
        <mask
            id="vapor-icons-color-AustriaColorIcon__a"
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
        <g mask="url(#vapor-icons-color-AustriaColorIcon__a)">
            <path fill="#C8102E" d="M19.858 0h-24v5.333h24z" />
            <path fill="#fff" d="M19.858 5.333h-24v5.332h24z" />
            <path fill="#C8102E" d="M19.858 10.667h-24V16h24z" />
        </g>
    </IconBase>
);
export default AustriaColorIcon;
