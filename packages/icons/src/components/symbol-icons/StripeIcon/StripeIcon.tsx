import IconBase from '~/components/icon-base';
import type { IconProps } from '~/components/icon-base';

const StripeIcon = (props: IconProps) => (
    <IconBase xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 16 16" {...props}>
        <g clipPath="url(#vapor-icons-mono-StripeIcon__a)">
            <path
                fill="currentColor"
                fillRule="evenodd"
                d="M16 0H0v16h16zM8.196 5.696c-.512 0-.82.148-.82.524 0 .412.533.594 1.195.819 1.077.366 2.495.849 2.505 2.633 0 1.732-1.384 2.728-3.396 2.728-.832 0-1.74-.164-2.64-.552v-2.3c.812.444 1.836.772 2.64.772.54 0 .928-.144.928-.588 0-.457-.578-.666-1.276-.918-1.061-.384-2.4-.868-2.4-2.478C4.932 4.624 6.236 3.6 8.2 3.6c.8 0 1.592.124 2.396.444v2.272c-.736-.396-1.664-.62-2.4-.62"
                clipRule="evenodd"
            />
        </g>
        <defs>
            <clipPath id="vapor-icons-mono-StripeIcon__a">
                <path fill="#fff" d="M0 0h16v16H0z" />
            </clipPath>
        </defs>
    </IconBase>
);
export default StripeIcon;
