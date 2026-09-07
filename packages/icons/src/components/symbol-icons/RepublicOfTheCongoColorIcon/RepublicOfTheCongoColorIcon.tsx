import IconBase from '~/components/icon-base';
import type { IconProps } from '~/components/icon-base';

const RepublicOfTheCongoColorIcon = (props: IconProps) => (
    <IconBase xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 16 16" {...props}>
        <mask
            id="vapor-icons-color-RepublicOfTheCongoColorIcon__a"
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
        <g mask="url(#vapor-icons-color-RepublicOfTheCongoColorIcon__a)">
            <path fill="#DA1A35" d="M4 16h16V0z" />
            <path fill="#FBDE4A" d="M12 0-4 16h8L20 0z" />
            <path fill="#009543" d="M-4 0v16L12 0z" />
        </g>
    </IconBase>
);
export default RepublicOfTheCongoColorIcon;
