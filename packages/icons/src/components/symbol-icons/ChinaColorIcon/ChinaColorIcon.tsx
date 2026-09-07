import IconBase from '~/components/icon-base';
import type { IconProps } from '~/components/icon-base';

const ChinaColorIcon = (props: IconProps) => (
    <IconBase xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 16 16" {...props}>
        <mask
            id="vapor-icons-color-ChinaColorIcon__a"
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
        <g mask="url(#vapor-icons-color-ChinaColorIcon__a)">
            <path fill="#EE1C25" d="M24 0H0v16h24z" />
            <path
                fill="#FF0"
                d="m4.01 1.73.526 1.617h1.7l-1.374.998.525 1.619-1.376-1-1.375 1 .526-1.619-1.375-.998h1.698zM8.29.953l-.045.565.524.218-.553.131-.047.566-.294-.486-.553.131.37-.43-.294-.484.524.218zm-.015 5.581-.033.568.529.205-.55.144-.03.567-.307-.476-.55.143.36-.44-.307-.476.528.205zm.955-3.952.08.562-.51.249.56.098.078.562.267-.5.559.098-.395-.41.267-.5-.51.25zm.823 3.702-.204-.53.44-.358-.567.031-.206-.529-.145.55-.566.03.477.307-.146.55.44-.359z"
            />
        </g>
    </IconBase>
);
export default ChinaColorIcon;
