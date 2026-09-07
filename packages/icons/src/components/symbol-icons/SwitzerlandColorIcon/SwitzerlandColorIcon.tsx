import IconBase from '~/components/icon-base';
import type { IconProps } from '~/components/icon-base';

const SwitzerlandColorIcon = (props: IconProps) => (
    <IconBase xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 16 16" {...props}>
        <mask
            id="vapor-icons-color-SwitzerlandColorIcon__a"
            width={16}
            height={16}
            x={0}
            y={0}
            maskUnits="userSpaceOnUse"
            style={{
                maskType: 'luminance',
            }}
        >
            <path fill="#fff" d="M8 16A8 8 0 1 0 8 0a8 8 0 0 0 0 16" />
        </mask>
        <g mask="url(#vapor-icons-color-SwitzerlandColorIcon__a)">
            <path fill="red" d="M16 0H0v16h16z" />
            <path
                fill="#fff"
                fillRule="evenodd"
                d="M12.978 6.518H9.482V3.022H6.518v3.496H3.022v2.964h3.496v3.496h2.964V9.482h3.496z"
                clipRule="evenodd"
            />
        </g>
    </IconBase>
);
export default SwitzerlandColorIcon;
