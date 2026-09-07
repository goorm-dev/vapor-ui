import IconBase from '~/components/icon-base';
import type { IconProps } from '~/components/icon-base';

const UnitedArabEmiratesColorIcon = (props: IconProps) => (
    <IconBase xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 16 16" {...props}>
        <mask
            id="vapor-icons-color-UnitedArabEmiratesColorIcon__a"
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
        <g mask="url(#vapor-icons-color-UnitedArabEmiratesColorIcon__a)">
            <path fill="#000" d="M32 10.684H7.893V16H32z" />
            <path fill="#00742B" d="M32 0H7.893v5.316H32z" />
            <path fill="#fff" d="M32 5.316H7.893v5.368H32z" />
            <path fill="red" d="M7.893 0H0v16h7.893z" />
        </g>
    </IconBase>
);
export default UnitedArabEmiratesColorIcon;
