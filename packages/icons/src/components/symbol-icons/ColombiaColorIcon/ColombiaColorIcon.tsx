import IconBase from '~/components/icon-base';
import type { IconProps } from '~/components/icon-base';
import { useIconId } from '~/components/use-icon-id';

const ColombiaColorIcon = (props: IconProps) => {
    const id = useIconId('vapor-icons-color-ColombiaColorIcon');
    return (
        <IconBase xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 16 16" {...props}>
            <mask
                id={`${id}__a`}
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
            <g mask={`url(#${id}__a)`}>
                <path fill="#CE1126" d="M20 11.978H-4V16h24z" />
                <path fill="#FCD116" d="M20 0H-4v8.025h24z" />
                <path fill="#003893" d="M20 8.025H-4v3.953h24z" />
            </g>
        </IconBase>
    );
};
export default ColombiaColorIcon;
