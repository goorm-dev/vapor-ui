import IconBase from '~/components/icon-base';
import type { IconProps } from '~/components/icon-base';

const MailIcon = (props: IconProps) => (
    <IconBase xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 16 16" {...props}>
        <path
            fill="currentColor"
            d="M2.667 13.333q-.55 0-.942-.391A1.28 1.28 0 0 1 1.333 12V4q0-.55.392-.942.391-.39.942-.391h10.667q.55 0 .941.391.392.392.392.942v8q0 .55-.392.942a1.28 1.28 0 0 1-.941.391zM8 8.55a.7.7 0 0 0 .35-.1l4.717-2.95a.55.55 0 0 0 .267-.483.54.54 0 0 0-.284-.5q-.283-.167-.583.016L8 7.333l-4.466-2.8q-.3-.183-.584-.008a.55.55 0 0 0-.283.492.6.6 0 0 0 .067.291.45.45 0 0 0 .2.192L7.65 8.45a.7.7 0 0 0 .35.1"
        />
    </IconBase>
);
export default MailIcon;
