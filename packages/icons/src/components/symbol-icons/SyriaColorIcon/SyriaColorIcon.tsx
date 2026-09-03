import IconBase from '~/components/icon-base';
import type { IconProps } from '~/components/icon-base';

const SyriaColorIcon = (props: IconProps) => (
    <IconBase xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 16 16" {...props}>
        <mask
            id="vapor-icons-color-SyriaColorIcon__a"
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
        <g mask="url(#vapor-icons-color-SyriaColorIcon__a)">
            <path fill="#CE1126" d="M20 0H-4v5.333h24z" />
            <path fill="#fff" d="M20 5.333H-4v5.333h24z" />
            <path fill="#000" d="M20 10.667H-4V16h24z" />
            <path
                fill="#007A3D"
                d="m12.004 5.99-.498 1.532h-1.61l1.302.947L10.7 10l1.304-.945 1.302.945-.497-1.53 1.302-.948h-1.61zM4.498 7.513 4 5.98l-.497 1.533h-1.61l1.301.945-.496 1.531L4 9.044l1.303.945-.498-1.53 1.302-.946z"
            />
        </g>
    </IconBase>
);
export default SyriaColorIcon;
