import IconBase from '~/components/icon-base';
import type { IconProps } from '~/components/icon-base';

const BarbadosColorIcon = (props: IconProps) => (
    <IconBase xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 16 16" {...props}>
        <mask
            id="vapor-icons-color-BarbadosColorIcon__a"
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
        <g mask="url(#vapor-icons-color-BarbadosColorIcon__a)">
            <path fill="#002180" d="M4.01 0H-4v16h8.01zM20 0h-8.01v16H20z" />
            <path fill="#FFC821" d="M11.99 0H4.01v16h7.98z" />
            <path
                fill="#000"
                d="M9.693 6.11c.234-.037.305-.2.396-.092.09.107-.414.253-.756 3.097l-.864-.124V5.945s.522.019.684.126C8.505 5.42 8 4.073 8 4.073s-.504 1.35-1.153 1.998c.162-.107.684-.126.684-.126v3.046l-.864.124c-.342-2.846-.845-2.99-.756-3.097.09-.107.162.055.396.091.055 0-.882-.936-1.836-.918 1.747 2.538 1.602 4.807 1.602 4.807l1.458-.233v2.159h.936V9.765l1.458.233s-.143-2.269 1.602-4.807c-.954-.018-1.89.918-1.836.918z"
            />
        </g>
    </IconBase>
);
export default BarbadosColorIcon;
