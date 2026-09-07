import IconBase from '~/components/icon-base';
import type { IconProps } from '~/components/icon-base';

const AzerbaijanColorIcon = (props: IconProps) => (
    <IconBase xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 16 16" {...props}>
        <mask
            id="vapor-icons-color-AzerbaijanColorIcon__a"
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
        <g mask="url(#vapor-icons-color-AzerbaijanColorIcon__a)">
            <path fill="#3D9D32" d="M24 10.667H-8V16h32z" />
            <path fill="#00BAE5" d="M24 0H-8v5.333h32z" />
            <path fill="#EE2436" d="M24 5.333H-8v5.332h32z" />
            <path
                fill="#fff"
                d="M8.107 10.027a2.027 2.027 0 1 1 1.168-3.683 2.45 2.45 0 0 0-1.808-.799 2.453 2.453 0 0 0 0 4.906c.717 0 1.358-.31 1.808-.798-.331.232-.733.37-1.168.37z"
            />
            <path
                fill="#fff"
                d="m10.027 6.727.244.684.656-.311-.312.656L11.3 8l-.686.244.313.656-.656-.31-.244.683-.243-.684-.657.311.311-.656L8.753 8l.685-.244-.31-.656.656.31z"
            />
        </g>
    </IconBase>
);
export default AzerbaijanColorIcon;
