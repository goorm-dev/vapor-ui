import IconBase from '~/components/icon-base';
import type { IconProps } from '~/components/icon-base';

const BellOnIcon = (props: IconProps) => (
    <IconBase xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 16 16" {...props}>
        <path
            fill="currentColor"
            d="M3.1 12.9a.68.68 0 0 1-.499-.201.68.68 0 0 1-.201-.499q0-.297.201-.499A.68.68 0 0 1 3.1 11.5h.7V6.6a4.1 4.1 0 0 1 .875-2.581A4.04 4.04 0 0 1 6.95 2.54v-.49q0-.438.306-.744T8 1t.744.306.306.744v.49a4.04 4.04 0 0 1 2.275 1.479A4.1 4.1 0 0 1 12.2 6.6v4.9h.7q.297 0 .499.201.2.2.2.499a.68.68 0 0 1-.2.499.68.68 0 0 1-.5.201zM8 15q-.578 0-.989-.411A1.35 1.35 0 0 1 6.6 13.6h2.8q0 .578-.411.989a1.35 1.35 0 0 1-.99.411"
        />
    </IconBase>
);
export default BellOnIcon;
