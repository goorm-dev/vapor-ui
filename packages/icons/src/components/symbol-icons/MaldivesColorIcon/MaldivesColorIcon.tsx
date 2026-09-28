import IconBase from '~/components/icon-base';
import type { IconProps } from '~/components/icon-base';

const MaldivesColorIcon = (props: IconProps) => (
    <IconBase xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 16 16" {...props}>
        <mask
            id="vapor-icons-color-MaldivesColorIcon__a"
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
        <g mask="url(#vapor-icons-color-MaldivesColorIcon__a)">
            <path fill="#D30731" d="M20 0H-4v16h24z" />
            <path fill="#007F37" d="M16.013 4.029H-.013v7.942h16.026z" />
            <path
                fill="#fff"
                d="M7.358 8.113a2.76 2.76 0 0 1 2.346-2.728 3 3 0 0 0-.417-.034 2.764 2.764 0 1 0 0 5.527q.212-.002.417-.034a2.76 2.76 0 0 1-2.346-2.728z"
            />
        </g>
    </IconBase>
);
export default MaldivesColorIcon;
