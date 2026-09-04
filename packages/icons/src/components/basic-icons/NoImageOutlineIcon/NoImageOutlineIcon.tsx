import IconBase from '~/components/icon-base';
import type { IconProps } from '~/components/icon-base';

const NoImageOutlineIcon = (props: IconProps) => (
    <IconBase xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 16 16" {...props}>
        <path
            fill="currentColor"
            d="M14 3.333v7.334q0 .333-.208.5a.7.7 0 0 1-.917-.008q-.208-.176-.208-.509V3.333H5.333q-.333 0-.5-.208a.72.72 0 0 1 0-.917Q5 2 5.333 2h7.334q.55 0 .941.392.392.391.392.941M3.333 14q-.55 0-.941-.392A1.28 1.28 0 0 1 2 12.667v-8.8l-.6-.6a.63.63 0 0 1-.183-.467q0-.283.183-.467a.63.63 0 0 1 .467-.183q.283 0 .466.183l11.334 11.334a.63.63 0 0 1 .183.466.63.63 0 0 1-.183.467.63.63 0 0 1-.467.183.63.63 0 0 1-.466-.183l-.6-.6zm6.117-2.667H4.667a.32.32 0 0 1-.3-.183.29.29 0 0 1 .033-.35l1.333-1.783A.32.32 0 0 1 6 8.883q.166 0 .267.134l1.233 1.65.55-.734-4.717-4.716v7.45h7.45z"
        />
    </IconBase>
);
export default NoImageOutlineIcon;
