import IconBase from '~/components/icon-base';
import type { IconProps } from '~/components/icon-base';

const PhoneIcon = (props: IconProps) => (
    <IconBase xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 16 16" {...props}>
        <path
            fill="currentColor"
            d="M7.278 12.694h1.444q.144 0 .253-.108a.346.346 0 0 0 0-.505.35.35 0 0 0-.253-.109H7.278a.35.35 0 0 0-.253.109.346.346 0 0 0 0 .505.35.35 0 0 0 .253.108M4.75 14.5q-.447 0-.765-.318a1.04 1.04 0 0 1-.318-.765V2.583q0-.447.318-.765T4.75 1.5h6.5q.447 0 .765.318t.318.765v10.834q0 .447-.318.765a1.04 1.04 0 0 1-.765.318zm0-4.333h6.5V4.389h-6.5z"
        />
    </IconBase>
);
export default PhoneIcon;
