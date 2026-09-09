import IconBase from '~/components/icon-base';
import type { IconProps } from '~/components/icon-base';

const NauruColorIcon = (props: IconProps) => (
    <IconBase xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 16 16" {...props}>
        <mask
            id="vapor-icons-color-NauruColorIcon__a"
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
        <g mask="url(#vapor-icons-color-NauruColorIcon__a)">
            <path fill="#002780" d="M27.853 0h-32v16h32z" />
            <path
                fill="#fff"
                d="m3.84 8.675.318 1.483 1.017-1.127-.468 1.444 1.446-.466-1.127 1.016 1.483.319-1.483.318 1.127 1.016-1.446-.465.468 1.443-1.017-1.125-.318 1.484-.318-1.484-1.016 1.125.465-1.443-1.444.465 1.126-1.016-1.484-.318 1.484-.319-1.126-1.016 1.444.466-.465-1.444 1.016 1.127z"
            />
            <path fill="#FFC718" d="M27.853 7.325h-32v1.348h32z" />
        </g>
    </IconBase>
);
export default NauruColorIcon;
