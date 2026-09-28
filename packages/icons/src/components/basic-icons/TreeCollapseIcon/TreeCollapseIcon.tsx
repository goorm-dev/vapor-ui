import IconBase from '~/components/icon-base';
import type { IconProps } from '~/components/icon-base';

const TreeCollapseIcon = (props: IconProps) => (
    <IconBase xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 16 16" {...props}>
        <path
            fill="currentColor"
            d="M3.2 14q-.495 0-.848-.352A1.16 1.16 0 0 1 2 12.8V5.6q0-.495.353-.847.351-.353.847-.353h1.2V3.2q0-.495.353-.848Q5.105 2 5.6 2h7.2q.494 0 .848.353.352.351.352.847v7.2q0 .495-.352.848a1.16 1.16 0 0 1-.848.352h-1.2v1.2q0 .494-.352.848A1.16 1.16 0 0 1 10.4 14zm2.4-3.6h7.2V3.2H5.6zm1.8-3a.58.58 0 0 1-.428-.173A.58.58 0 0 1 6.8 6.8a.58.58 0 0 1 .173-.428A.58.58 0 0 1 7.4 6.2H11a.58.58 0 0 1 .428.172.58.58 0 0 1 .172.428.58.58 0 0 1-.172.428A.58.58 0 0 1 11 7.4z"
        />
    </IconBase>
);
export default TreeCollapseIcon;
