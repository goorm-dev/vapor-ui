import IconBase from '~/components/icon-base';
import type { IconProps } from '~/components/icon-base';

const FilterIcon = (props: IconProps) => (
    <IconBase xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 16 16" {...props}>
        <path
            fill="currentColor"
            d="M7.333 13.333a.65.65 0 0 1-.475-.191.65.65 0 0 1-.191-.475v-4L2.8 3.733a.64.64 0 0 1-.075-.7q.176-.366.608-.366h9.334q.432 0 .608.366a.64.64 0 0 1-.075.7L9.333 8.667v4a.65.65 0 0 1-.191.475.65.65 0 0 1-.475.191z"
        />
    </IconBase>
);
export default FilterIcon;
