import IconBase from '~/components/icon-base';
import type { IconProps } from '~/components/icon-base';

const TrinidadAndTobagoColorIcon = (props: IconProps) => (
    <IconBase xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 16 16" {...props}>
        <mask
            id="vapor-icons-color-TrinidadAndTobagoColorIcon__a"
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
        <g mask="url(#vapor-icons-color-TrinidadAndTobagoColorIcon__a)">
            <path fill="#000" d="m-3.97 0 18.506 16h5.508L1.538 0z" />
            <path fill="#DB1332" d="M-5.333 16H13.17L-5.333.002z" />
            <path
                fill="#fff"
                d="M-5.333 0v.002L13.17 16h1.367L-3.969 0zm6.871 0 18.506 16h1.289v-.12L2.963 0z"
            />
            <path fill="#DB1332" d="M21.333 15.88V0H2.963z" />
        </g>
    </IconBase>
);
export default TrinidadAndTobagoColorIcon;
