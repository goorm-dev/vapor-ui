import IconBase from '~/components/icon-base';
import type { IconProps } from '~/components/icon-base';

const ExploreIcon = (props: IconProps) => (
    <IconBase xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 16 16" {...props}>
        <path
            fill="currentColor"
            d="M8 7.2q.332 0 .566.234A.77.77 0 0 1 8.8 8q0 .332-.234.566A.77.77 0 0 1 8 8.8a.7.7 0 0 1-.566-.225A.8.8 0 0 1 7.2 8q0-.333.234-.566A.77.77 0 0 1 8 7.2"
        />
        <path
            fill="currentColor"
            fillRule="evenodd"
            d="M8 1.6q1.334 0 2.492.5A6.48 6.48 0 0 1 13.9 5.51q.5 1.158.5 2.491 0 1.317-.5 2.483a6.45 6.45 0 0 1-3.408 3.417q-1.158.5-2.492.5a6.2 6.2 0 0 1-2.483-.5 6.5 6.5 0 0 1-2.041-1.375A6.5 6.5 0 0 1 2.1 10.483 6.2 6.2 0 0 1 1.6 8q0-1.334.5-2.491A6.45 6.45 0 0 1 5.517 2.1 6.2 6.2 0 0 1 8 1.6m2.884 3.2-4.1 1.7a.44.44 0 0 0-.284.283l-1.684 4.084a.22.22 0 0 0 .051.267.22.22 0 0 0 .267.05l4.083-1.7A.44.44 0 0 0 9.5 9.2l1.7-4.083a.22.22 0 0 0-.05-.266.22.22 0 0 0-.266-.051"
            clipRule="evenodd"
        />
    </IconBase>
);
export default ExploreIcon;
