import IconBase from '~/components/icon-base';
import type { IconProps } from '~/components/icon-base';

const FlaskIcon = (props: IconProps) => (
    <IconBase xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 16 16" {...props}>
        <path
            fill="currentColor"
            d="M3.333 14q-.85 0-1.208-.758t.175-1.409l3.7-4.5v-4h-.667a.65.65 0 0 1-.475-.191.65.65 0 0 1-.191-.475q0-.285.191-.475A.65.65 0 0 1 5.333 2h5.334q.283 0 .475.192a.65.65 0 0 1 .191.475.65.65 0 0 1-.191.475.65.65 0 0 1-.475.191H10v4l3.7 4.5q.534.65.175 1.409-.359.758-1.208.758zm1.334-2h6.666L9.067 9.333H6.933z"
        />
    </IconBase>
);
export default FlaskIcon;
