import IconBase, { type IconProps } from '~/components/icon-base';

const TrinidadAndTobagoColorIcon = (props: IconProps) => (
    <IconBase viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
        <mask
            id="mask0_9214_1406"
            style={{ maskType: 'luminance' }}
            maskUnits="userSpaceOnUse"
            x="0"
            y="0"
            width="16"
            height="16"
        >
            <path
                d="M8 16C12.4183 16 16 12.4183 16 8C16 3.58172 12.4183 0 8 0C3.58172 0 0 3.58172 0 8C0 12.4183 3.58172 16 8 16Z"
                fill="white"
            />
        </mask>
        <g mask="url(#mask0_9214_1406)">
            <path d="M-3.96909 0L14.5364 16H20.0436L1.53819 0H-3.96909Z" fill="black" />
            <path d="M-5.33276 16H13.1691L-5.33276 0.00183105V16Z" fill="#DB1332" />
            <path d="M-5.33276 0V0.00181996L13.1691 16H14.5363L-3.96913 0H-5.33276Z" fill="white" />
            <path d="M1.5382 0L20.0437 16H21.3327V15.88L2.96365 0H1.5382Z" fill="white" />
            <path d="M21.3327 15.88V0H2.96365L21.3327 15.88Z" fill="#DB1332" />
        </g>
    </IconBase>
);

export default TrinidadAndTobagoColorIcon;
