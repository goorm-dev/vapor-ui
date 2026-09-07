import IconBase from '~/components/icon-base';
import type { IconProps } from '~/components/icon-base';

const PlugInIcon = (props: IconProps) => (
    <IconBase xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 16 16" {...props}>
        <path
            fill="currentColor"
            d="M4.333 15.333v-2.8a1.96 1.96 0 0 1-.958-.708A1.9 1.9 0 0 1 3 10.667V9.333h4v1.333q0 .65-.375 1.159-.376.508-.958.708v2.8zm5.334 0v-2.8a1.96 1.96 0 0 1-.959-.708 1.9 1.9 0 0 1-.375-1.158V9.333h4v1.333q0 .65-.375 1.159-.376.508-.958.708v2.8zM3 8V4.667q0-.285.192-.476A.65.65 0 0 1 3.667 4h.666V1.333q0-.283.192-.475A.65.65 0 0 1 5 .667q.283 0 .475.191a.65.65 0 0 1 .192.475V4h.666q.285 0 .475.191A.65.65 0 0 1 7 4.667V8zm5.333 0V4.667q0-.285.192-.476A.65.65 0 0 1 9 4h.667V1.333q0-.283.191-.475a.65.65 0 0 1 .475-.191q.285 0 .475.191a.65.65 0 0 1 .192.475V4h.667q.283 0 .475.191a.65.65 0 0 1 .191.476V8z"
        />
    </IconBase>
);
export default PlugInIcon;
