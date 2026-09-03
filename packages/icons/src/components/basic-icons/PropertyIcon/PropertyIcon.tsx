import IconBase from '~/components/icon-base';
import type { IconProps } from '~/components/icon-base';

const PropertyIcon = (props: IconProps) => (
    <IconBase xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 16 16" {...props}>
        <path
            fill="currentColor"
            fillRule="evenodd"
            d="M6.579 9.206h2.209a2.43 2.43 0 0 0 2.428-2.429A2.43 2.43 0 0 0 8.788 4.35h-2.86a.65.65 0 0 0-.65.65v5.999a.65.65 0 1 0 1.3 0zM1.499 8A6.5 6.5 0 1 1 14.5 8a6.5 6.5 0 0 1-13 0m5.08-2.35h2.209a1.128 1.128 0 0 1 0 2.255h-2.21z"
            clipRule="evenodd"
        />
    </IconBase>
);
export default PropertyIcon;
