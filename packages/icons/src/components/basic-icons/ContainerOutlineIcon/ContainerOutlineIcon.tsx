import IconBase from '~/components/icon-base';
import type { IconProps } from '~/components/icon-base';

const ContainerOutlineIcon = (props: IconProps) => (
    <IconBase xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 16 16" {...props}>
        <path
            fill="currentColor"
            fillRule="evenodd"
            d="M3.2 3.2h9.6v9.6H3.2zM2 3.2A1.2 1.2 0 0 1 3.2 2h9.6A1.2 1.2 0 0 1 14 3.2v9.6a1.2 1.2 0 0 1-1.2 1.2H3.2A1.2 1.2 0 0 1 2 12.8zm3.175.8c.373 0 .675.302.675.675v6.65a.675.675 0 1 1-1.35 0v-6.65c0-.373.302-.675.675-.675m3.525.675a.675.675 0 0 0-1.35 0v6.65a.675.675 0 1 0 1.35 0zm2.85 0a.675.675 0 1 0-1.35 0v6.65a.675.675 0 1 0 1.35 0z"
            clipRule="evenodd"
        />
    </IconBase>
);
export default ContainerOutlineIcon;
