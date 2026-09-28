import IconBase from '~/components/icon-base';
import type { IconProps } from '~/components/icon-base';

const SchoolOutlineIcon = (props: IconProps) => (
    <IconBase xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 16 16" {...props}>
        <path fill="currentColor" d="M7.83 11.5a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3" />
        <path
            fill="currentColor"
            fillRule="evenodd"
            d="M7.33 2.167v2.616q-.05.03-.1.067l-5.55 3.9a.84.84 0 0 0-.258.283.75.75 0 0 0-.092.367.9.9 0 0 0 .258.65.86.86 0 0 0 .642.267h.433v3H1.33v1.333h13.333v-1.333H13.33v-3h.433q.384 0 .642-.259a.87.87 0 0 0 .258-.641.81.81 0 0 0-.35-.667l-5.55-3.9-.1-.067v-.616h2.667a.65.65 0 0 0 .475-.192.65.65 0 0 0 .192-.475V2.167a.65.65 0 0 0-.192-.475.65.65 0 0 0-.475-.192H7.997a.65.65 0 0 0-.475.192.65.65 0 0 0-.192.475m4.667 11.15V8.75l-4-2.8-4 2.8v4.567z"
            clipRule="evenodd"
        />
    </IconBase>
);
export default SchoolOutlineIcon;
