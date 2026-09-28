import IconBase from '~/components/icon-base';
import type { IconProps } from '~/components/icon-base';

const HeartIcon = (props: IconProps) => (
    <IconBase xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 16 16" {...props}>
        <path
            fill="currentColor"
            d="M8 13.783a1.5 1.5 0 0 1-.475-.083 1.1 1.1 0 0 1-.425-.267l-1.15-1.05a46 46 0 0 1-3.19-3.208Q1.334 7.584 1.334 5.667q0-1.567 1.05-2.617T5 2q.885 0 1.667.375Q7.45 2.75 8 3.4a4 4 0 0 1 1.334-1.025A3.8 3.8 0 0 1 11 2q1.567 0 2.617 1.05t1.05 2.617q0 1.916-1.417 3.516a40 40 0 0 1-3.216 3.217L8.9 13.433a1.1 1.1 0 0 1-.425.267 1.5 1.5 0 0 1-.475.083"
        />
    </IconBase>
);
export default HeartIcon;
