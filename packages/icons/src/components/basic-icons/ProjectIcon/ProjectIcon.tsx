import IconBase from '~/components/icon-base';
import type { IconProps } from '~/components/icon-base';

const ProjectIcon = (props: IconProps) => (
    <IconBase xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 16 16" {...props}>
        <path
            fill="currentColor"
            d="M2.8 14q-.495 0-.847-.352A1.16 1.16 0 0 1 1.6 12.8V5.6q0-.495.353-.847.352-.353.847-.353h2.8V3.196q0-.496.353-.846T6.802 2h2.402q.496 0 .846.353.35.351.35.847v1.2h2.8q.495 0 .848.353.352.352.352.847v7.2q0 .494-.352.848A1.16 1.16 0 0 1 13.2 14zm4-9.6h2.4V3.2H6.8z"
        />
    </IconBase>
);
export default ProjectIcon;
