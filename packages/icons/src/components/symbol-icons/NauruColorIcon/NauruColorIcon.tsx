import IconBase, { type IconProps } from '~/components/icon-base';

const NauruColorIcon = (props: IconProps) => (
    <IconBase viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
        <mask
            id="mask0_9214_1392"
            style={{ maskType: 'luminance' }}
            maskUnits="userSpaceOnUse"
            x="0"
            y="0"
            width="16"
            height="16"
        >
            <path
                d="M8 16C12.4183 16 16 12.4183 16 8C16 3.58172 12.4183 0 8 0C3.58172 0 0 3.58172 0 8C0 12.4183 3.58172 16 8 16Z"
                fill="white"
            />
        </mask>
        <g mask="url(#mask0_9214_1392)">
            <path d="M27.8528 0H-4.14722V16H27.8528V0Z" fill="#002780" />
            <path
                d="M3.84009 8.67456L4.15827 10.1582L5.17465 9.03093L4.70736 10.4746L6.15281 10.0091L5.02555 11.0255L6.50917 11.3437L5.02555 11.6618L6.15281 12.6782L4.70736 12.2127L5.17465 13.6564L4.15827 12.5309L3.84009 14.0146L3.52191 12.5309L2.50553 13.6564L2.97099 12.2127L1.52737 12.6782L2.65281 11.6618L1.16919 11.3437L2.65281 11.0255L1.52737 10.0091L2.97099 10.4746L2.50553 9.03093L3.52191 10.1582L3.84009 8.67456Z"
                fill="white"
            />
            <path d="M27.8528 7.32544H-4.14722V8.67271H27.8528V7.32544Z" fill="#FFC718" />
        </g>
    </IconBase>
);

export default NauruColorIcon;
