import IconBase from '~/components/icon-base';
import type { IconProps } from '~/components/icon-base';

const HondurasColorIcon = (props: IconProps) => (
    <IconBase xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 16 16" {...props}>
        <mask
            id="vapor-icons-color-HondurasColorIcon__a"
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
        <g mask="url(#vapor-icons-color-HondurasColorIcon__a)">
            <path fill="#0D3B9F" d="M24 0H-8v5.333h32z" />
            <path fill="#fff" d="M24 5.333H-8v5.333h32z" />
            <path
                fill="#0D3B9F"
                d="M24 10.667H-8V16h32zm-20.253-4.3-.183-.562-.182.562H2.79l.478.348-.184.561.479-.347.48.347-.184-.561.478-.348zm0 2.668-.183-.564-.182.564H2.79l.478.347-.184.562.479-.348.48.348-.184-.562.478-.347zm8.871-2.668-.182-.562-.183.562h-.591l.478.348-.182.561.478-.347.479.347-.184-.561.478-.348zM8.184 7.7 8 7.138l-.182.562h-.593l.479.347-.182.564L8 8.264l.478.347-.182-.564.479-.347zm4.434 1.335-.182-.564-.183.564h-.591l.478.347-.182.562.478-.348.479.348-.184-.562.478-.347z"
            />
        </g>
    </IconBase>
);
export default HondurasColorIcon;
