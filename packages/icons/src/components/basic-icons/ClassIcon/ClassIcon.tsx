import IconBase from '~/components/icon-base';
import type { IconProps } from '~/components/icon-base';

const ClassIcon = (props: IconProps) => (
    <IconBase xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 16 16" {...props}>
        <path
            fill="currentColor"
            fillRule="evenodd"
            d="M8 11.9c-2.15 0-3.9-1.75-3.9-3.9A3.905 3.905 0 0 1 8 4.1c1.725 0 3.175 1.132 3.688 2.688h-1.402A2.59 2.59 0 0 0 8 5.4 2.6 2.6 0 0 0 5.4 8 2.6 2.6 0 0 0 8 10.6a2.59 2.59 0 0 0 2.465-1.812h1.355A3.906 3.906 0 0 1 8 11.9M8 1.5a6.5 6.5 0 1 0 0 13 6.5 6.5 0 0 0 0-13"
            clipRule="evenodd"
        />
    </IconBase>
);
export default ClassIcon;
