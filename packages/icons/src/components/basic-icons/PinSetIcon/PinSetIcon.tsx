import IconBase from '~/components/icon-base';
import type { IconProps } from '~/components/icon-base';

const PinSetIcon = (props: IconProps) => (
    <IconBase xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 16 16" {...props}>
        <path
            fill="currentColor"
            d="M10.667 3.333V8L11.8 9.133a.67.67 0 0 1 .2.484V10a.65.65 0 0 1-.192.475.65.65 0 0 1-.475.192H8.667v3.9a.65.65 0 0 1-.192.475.65.65 0 0 1-.475.191.65.65 0 0 1-.475-.191.65.65 0 0 1-.192-.475v-3.9H4.667a.65.65 0 0 1-.475-.192A.65.65 0 0 1 4 10v-.383a.7.7 0 0 1 .2-.484L5.333 8V3.333a.65.65 0 0 1-.475-.191.65.65 0 0 1-.191-.475q0-.285.191-.475A.65.65 0 0 1 5.333 2h5.334q.283 0 .475.192a.65.65 0 0 1 .191.475.65.65 0 0 1-.191.475.65.65 0 0 1-.475.191"
        />
    </IconBase>
);
export default PinSetIcon;
