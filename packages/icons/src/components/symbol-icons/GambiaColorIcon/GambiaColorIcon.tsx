import IconBase from '~/components/icon-base';
import type { IconProps } from '~/components/icon-base';
import { useIconId } from '~/components/use-icon-id';

const GambiaColorIcon = (props: IconProps) => {
    const id = useIconId('vapor-icons-color-GambiaColorIcon');
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
                <path fill="#3A7728" d="M20 10.675H-4V16h24z" />
                <path fill="#CE1126" d="M20 0H-4v5.325h24z" />
                <path fill="#fff" d="M20 9.77H-4v.905h24zm0-4.445H-4v.904h24z" />
                <path fill="#0C1C8C" d="M20 6.23H-4v3.54h24z" />
            </g>
        </IconBase>
    );
};
export default GambiaColorIcon;
