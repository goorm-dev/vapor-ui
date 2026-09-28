import IconBase from '~/components/icon-base';
import type { IconProps } from '~/components/icon-base';

const UploadIcon = (props: IconProps) => (
    <IconBase xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 16 16" {...props}>
        <path
            fill="currentColor"
            d="M3.333 13.333h9.334q.282 0 .475.192a.65.65 0 0 1 .191.475.65.65 0 0 1-.191.475.65.65 0 0 1-.476.192H3.333a.65.65 0 0 1-.475-.192.65.65 0 0 1-.191-.475q0-.283.191-.475a.65.65 0 0 1 .475-.192M6.667 12a.65.65 0 0 1-.476-.192.65.65 0 0 1-.191-.475v-4H4.7a.62.62 0 0 1-.6-.375.64.64 0 0 1 .067-.708l3.3-4.233a.64.64 0 0 1 .241-.2.68.68 0 0 1 .583 0 .64.64 0 0 1 .242.2l3.3 4.233a.64.64 0 0 1 .067.708.62.62 0 0 1-.6.375H10v4a.65.65 0 0 1-.192.475.65.65 0 0 1-.475.192z"
        />
    </IconBase>
);
export default UploadIcon;
