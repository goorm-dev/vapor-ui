import IconBase from '~/components/icon-base';
import type { IconProps } from '~/components/icon-base';

const DarkIcon = (props: IconProps) => (
    <IconBase xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 16 16" {...props}>
        <path
            fill="currentColor"
            d="M8 14q-2.517 0-4.258-1.742Q2 10.518 2 8q0-2.3 1.5-3.992Q5 2.317 7.333 2.033a.6.6 0 0 1 .384.059q.166.09.266.241.1.15.109.35a.6.6 0 0 1-.125.384A3.43 3.43 0 0 0 7.4 5q0 1.5 1.05 2.55T11 8.6a3.6 3.6 0 0 0 1.933-.567.64.64 0 0 1 .375-.108.76.76 0 0 1 .342.092.6.6 0 0 1 .258.25q.091.165.059.4-.234 2.3-1.959 3.816T8 14"
        />
    </IconBase>
);
export default DarkIcon;
