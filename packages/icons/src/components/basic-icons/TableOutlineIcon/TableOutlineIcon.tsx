import IconBase from '~/components/icon-base';
import type { IconProps } from '~/components/icon-base';

const TableOutlineIcon = (props: IconProps) => (
    <IconBase xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 16 16" {...props}>
        <path
            fill="currentColor"
            d="M2.4 12.4V3.6q0-.495.352-.848.353-.352.848-.352h8.8q.495 0 .847.352.353.353.353.848v8.8q0 .495-.353.847a1.16 1.16 0 0 1-.847.353H3.6q-.495 0-.848-.353A1.16 1.16 0 0 1 2.4 12.4m1.2-6.45h8.8V3.6H3.6zm3.333 3.233h2.134V7.15H6.933zm0 3.217h2.134v-2.017H6.933zM3.6 9.183h2.133V7.15H3.6zm6.667 0H12.4V7.15h-2.133zM3.6 12.4h2.133v-2.017H3.6zm6.667 0H12.4v-2.017h-2.133z"
        />
    </IconBase>
);
export default TableOutlineIcon;
