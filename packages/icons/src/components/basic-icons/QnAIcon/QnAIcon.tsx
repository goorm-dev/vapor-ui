import IconBase from '~/components/icon-base';
import type { IconProps } from '~/components/icon-base';

const QnAIcon = (props: IconProps) => (
    <IconBase xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 16 16" {...props}>
        <path
            fill="currentColor"
            fillRule="evenodd"
            d="M2.467 13.998 4 12.465h9.334q.55 0 .941-.392.392-.391.392-.942v-8q0-.55-.392-.941a1.28 1.28 0 0 0-.941-.392H2.667q-.55 0-.942.392a1.28 1.28 0 0 0-.392.941v10.384q0 .45.409.624.408.176.725-.141m6.136-6.166H7.587l.744.972a1.5 1.5 0 0 1-.327.036c-.886-.004-1.465-.666-1.465-1.883 0-1.221.579-1.879 1.465-1.883.878.004 1.461.662 1.458 1.883.003.63-.154 1.115-.426 1.43zm-.599-3.805c-1.52 0-2.67 1.067-2.67 2.93 0 1.855 1.15 2.93 2.67 2.93.355 0 .693-.058 1-.173l.458.568h1.11l-.811-1.025c.56-.5.906-1.28.906-2.3 0-1.863-1.154-2.93-2.663-2.93"
            clipRule="evenodd"
        />
    </IconBase>
);
export default QnAIcon;
