import IconBase from '~/components/icon-base';
import type { IconProps } from '~/components/icon-base';

const MoroccoColorIcon = (props: IconProps) => (
    <IconBase xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 16 16" {...props}>
        <mask
            id="vapor-icons-color-MoroccoColorIcon__a"
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
        <g mask="url(#vapor-icons-color-MoroccoColorIcon__a)">
            <path fill="#C1272D" d="M21.949-1.298H-5.947v18.596h27.896z" />
            <path
                fill="#006233"
                d="m5.264 11.736 1.043-3.214-2.734-1.987h3.38L7.996 3.32 9.04 6.535h3.38L9.685 8.522l1.044 3.214L7.995 9.75 5.26 11.736zm2.734-2.538 1.886 1.37-.72-2.217 1.885-1.37H8.72L8 4.766l-.72 2.216H4.946L6.833 8.35l-.72 2.216z"
            />
            <path
                fill="#006233"
                d="M7.998 9.751 6.31 8.524l.646-1.988h2.089l.645 1.988L8 9.75zM6.833 8.353l1.165.845 1.166-.845-.446-1.37h-1.44z"
            />
        </g>
    </IconBase>
);
export default MoroccoColorIcon;
