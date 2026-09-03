import IconBase from '~/components/icon-base';
import type { IconProps } from '~/components/icon-base';

const MauritaniaColorIcon = (props: IconProps) => (
    <IconBase xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 16 16" {...props}>
        <mask
            id="vapor-icons-color-MauritaniaColorIcon__a"
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
        <g mask="url(#vapor-icons-color-MauritaniaColorIcon__a)">
            <path fill="#D01C1F" d="M20 0H-4v3.2h24zm0 12.8H-4V16h24z" />
            <path fill="#00A95C" d="M20 3.2H-4v9.6h24z" />
            <path
                fill="gold"
                fillRule="evenodd"
                d="M14.027 5.43C13.847 8.657 11.4 11.214 8 11.214S2.153 8.656 1.973 5.43C2.822 8.136 5.362 9.587 8 9.587s5.178-1.45 6.027-4.156"
                clipRule="evenodd"
            />
            <path
                fill="gold"
                fillRule="evenodd"
                d="m8 4.81.376 1.157h1.219l-.986.717.376 1.156L8 7.125l-.985.715.376-1.156-.984-.717h1.217z"
                clipRule="evenodd"
            />
        </g>
    </IconBase>
);
export default MauritaniaColorIcon;
