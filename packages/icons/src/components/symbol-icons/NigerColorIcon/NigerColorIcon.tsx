import IconBase from '~/components/icon-base';
import type { IconProps } from '~/components/icon-base';

const NigerColorIcon = (props: IconProps) => (
    <IconBase xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 16 16" {...props}>
        <mask
            id="vapor-icons-color-NigerColorIcon__a"
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
        <g mask="url(#vapor-icons-color-NigerColorIcon__a)">
            <path fill="#E05206" d="M19.86-2.165H-3.86V4.61h23.72z" />
            <path fill="#fff" d="M19.86 4.61H-3.86v6.777h23.72z" />
            <path fill="#0DB02B" d="M19.86 11.389H-3.86v6.776h23.72z" />
            <path fill="#E05206" d="M8 10.885a2.885 2.885 0 1 0 0-5.77 2.885 2.885 0 0 0 0 5.77" />
        </g>
    </IconBase>
);
export default NigerColorIcon;
