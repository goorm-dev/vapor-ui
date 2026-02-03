import IconBase, { type IconProps } from '~/components/icon-base';

const BreakpointIcon = (props: IconProps) => (
    <IconBase viewBox="0 0 16 16" xmlns="http://www.w3.org/2000/svg" {...props}>
        <path
            fillRule="evenodd"
            clipRule="evenodd"
            d="M14.5 8C14.5 4.41 11.59 1.5 8 1.5C4.41 1.5 1.5 4.41 1.5 8C1.5 11.59 4.41 14.5 8 14.5C11.59 14.5 14.5 11.59 14.5 8Z"
        />
    </IconBase>
);

export default BreakpointIcon;
