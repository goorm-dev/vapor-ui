import IconBase from '~/components/icon-base';
import type { IconProps } from '~/components/icon-base';

const GitIcon = (props: IconProps) => (
    <IconBase xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 16 16" {...props}>
        <path
            fill="currentColor"
            fillRule="evenodd"
            d="M14.736 7.377 8.623 1.264a.9.9 0 0 0-1.275 0L6.08 2.534l1.61 1.61a1.07 1.07 0 0 1 1.356 1.365l1.552 1.552a1.073 1.073 0 1 1-.643.605L8.507 6.217v3.809q.155.075.284.203a1.073 1.073 0 1 1-1.166-.235V6.152a1.07 1.07 0 0 1-.582-1.407L5.455 3.157l-4.19 4.191a.9.9 0 0 0 0 1.276l6.112 6.112a.9.9 0 0 0 1.275 0l6.084-6.084a.9.9 0 0 0 0-1.275"
            clipRule="evenodd"
        />
    </IconBase>
);
export default GitIcon;
