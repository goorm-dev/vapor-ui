import IconBase, { type IconProps } from '~/components/icon-base';

const DjiboutiColorIcon = (props: IconProps) => (
    <IconBase viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
        <mask
            id="mask0_9214_1323"
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
        <g mask="url(#mask0_9214_1323)">
            <path d="M-2.43994 15.9054V0.0908813H21.3782V15.9091L-2.43994 15.9054Z" fill="white" />
            <path
                d="M-2.53076 8V16L-2.52357 15.9964L21.4692 16V0H-2.53076V8ZM-2.34894 8V0.181818H21.2874V15.8182L-2.34894 15.8145V8Z"
                fill="#F2F2F0"
            />
            <path d="M21.4689 8H11.3289L-2.52393 15.9964V16H21.4761V8H21.4689Z" fill="#12AD2B" />
            <path d="M21.4692 8V0H-2.53076L11.3292 8H21.4692Z" fill="#6AB2E7" />
            <path
                fillRule="evenodd"
                clipRule="evenodd"
                d="M2.77259 6.0473L3.25803 7.54184H4.82897L3.55802 8.46548L4.04346 9.96003L2.77259 9.03639L1.50164 9.96003L1.98708 8.46548L0.714355 7.54184H2.28715L2.77259 6.0473Z"
                fill="#D7141A"
            />
        </g>
    </IconBase>
);

export default DjiboutiColorIcon;
