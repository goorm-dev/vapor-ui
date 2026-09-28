import IconBase from '~/components/icon-base';
import type { IconProps } from '~/components/icon-base';

const UkraineColorIcon = (props: IconProps) => (
    <IconBase xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 16 16" {...props}>
        <mask
            id="vapor-icons-color-UkraineColorIcon__a"
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
        <g mask="url(#vapor-icons-color-UkraineColorIcon__a)">
            <path fill="#0057B8" d="M19.858 0h-24v8h24z" />
            <path fill="gold" d="M19.858 8h-24v8h24z" />
        </g>
    </IconBase>
);
export default UkraineColorIcon;
