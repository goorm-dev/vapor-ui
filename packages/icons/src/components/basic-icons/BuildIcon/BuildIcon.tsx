import IconBase from '~/components/icon-base';
import type { IconProps } from '~/components/icon-base';

const BuildIcon = (props: IconProps) => (
    <IconBase xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 16 16" {...props}>
        <path
            fill="currentColor"
            d="M6 10q-1.667 0-2.833-1.167Q2 7.667 2 6q0-.333.05-.667Q2.1 5 2.233 4.7a.63.63 0 0 1 .209-.25.8.8 0 0 1 .275-.117.65.65 0 0 1 .6.184l1.75 1.75 1.2-1.2-1.75-1.75a.64.64 0 0 1-.184-.6.8.8 0 0 1 .117-.275.63.63 0 0 1 .25-.209q.3-.134.633-.183Q5.667 2 6 2q1.667 0 2.833 1.167Q10 4.333 10 6q0 .383-.067.725a4 4 0 0 1-.2.675l3.367 3.333q.483.484.483 1.184 0 .699-.483 1.183a1.6 1.6 0 0 1-1.183.483q-.7 0-1.184-.5L7.4 9.733a4 4 0 0 1-.675.2Q6.383 10 6 10"
        />
    </IconBase>
);
export default BuildIcon;
