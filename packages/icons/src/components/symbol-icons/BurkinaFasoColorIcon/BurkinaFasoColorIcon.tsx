import IconBase, { type IconProps } from '~/components/icon-base';

const BurkinaFasoColorIcon = (props: IconProps) => (
    <IconBase viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
        <mask
            id="mask0_9214_1315"
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
        <g mask="url(#mask0_9214_1315)">
            <path d="M22.3908 -1.59271H-6.38916V8.00002H22.3908V-1.59271Z" fill="#EF2B2D" />
            <path d="M22.3908 8.00006H-6.38916V17.5928H22.3908V8.00006Z" fill="#009E49" />
            <path
                fillRule="evenodd"
                clipRule="evenodd"
                d="M8.00013 4.83459L8.70921 7.01823H11.0055L9.14742 8.36733L9.85826 10.551L8.00013 9.20187L6.14191 10.551L6.85285 8.36733L4.99463 7.01823H7.29106L8.00013 4.83459Z"
                fill="#FCD116"
            />
        </g>
    </IconBase>
);

export default BurkinaFasoColorIcon;
