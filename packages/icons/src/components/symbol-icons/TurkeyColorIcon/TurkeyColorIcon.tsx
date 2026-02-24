import IconBase, { type IconProps } from '~/components/icon-base';

const TurkeyColorIcon = (props: IconProps) => (
    <IconBase viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
        <mask
            id="mask0_9214_1362"
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
        <g mask="url(#mask0_9214_1362)">
            <path d="M20.831 0H-3.16904V16H20.831V0Z" fill="#E30A17" />
            <path
                d="M10.1345 7.22547L9.27632 6.04547V7.50366L7.88907 7.95456L9.27632 8.40547V9.86365L10.1345 8.68365L11.52 9.13456L10.6636 7.95456L11.52 6.77456L10.1345 7.22547Z"
                fill="white"
            />
            <path
                d="M2.55278 7.96362C2.55278 6.19634 4.00188 4.76362 5.78915 4.76362C6.63642 4.76362 7.4037 5.08726 7.98189 5.61453C7.2528 4.60908 6.07096 3.95453 4.73459 3.95453C2.52005 3.95453 0.725494 5.74907 0.725494 7.96362C0.725494 10.1782 2.52005 11.9727 4.73459 11.9727C6.07096 11.9727 7.25461 11.3182 7.98189 10.3127C7.40552 10.84 6.63642 11.1636 5.78915 11.1636C4.00188 11.1636 2.55278 9.73089 2.55278 7.96362Z"
                fill="white"
            />
        </g>
    </IconBase>
);

export default TurkeyColorIcon;
