import IconBase from '~/components/icon-base';
import type { IconProps } from '~/components/icon-base';

const DownloadIcon = (props: IconProps) => (
    <IconBase xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 16 16" {...props}>
        <path
            fill="currentColor"
            d="M3.333 13.333h9.334q.282 0 .475.192a.65.65 0 0 1 .191.475.65.65 0 0 1-.191.475.65.65 0 0 1-.476.192H3.333a.65.65 0 0 1-.475-.192.65.65 0 0 1-.191-.475q0-.283.191-.475a.65.65 0 0 1 .475-.192M8 11.583a.7.7 0 0 1-.292-.066.64.64 0 0 1-.242-.2l-3.3-4.234a.64.64 0 0 1-.066-.708A.62.62 0 0 1 4.7 6H6V2q0-.283.191-.475a.65.65 0 0 1 .476-.192h2.666q.284 0 .475.192A.65.65 0 0 1 10 2v4h1.3q.417 0 .6.375t-.067.708l-3.3 4.234a.64.64 0 0 1-.242.2.7.7 0 0 1-.291.066"
        />
    </IconBase>
);
export default DownloadIcon;
