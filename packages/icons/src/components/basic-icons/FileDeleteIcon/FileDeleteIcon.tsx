import IconBase, { type IconProps } from '~/components/icon-base';

const FileDeleteIcon = (props: IconProps) => (
    <IconBase viewBox="0 0 16 16" xmlns="http://www.w3.org/2000/svg" {...props}>
        <path
            fillRule="evenodd"
            clipRule="evenodd"
            d="M1.5 3.44995C1.5 2.89767 1.94772 2.44995 2.5 2.44995H7.15H7.85H13.5C14.0523 2.44995 14.5 2.89767 14.5 3.44995V6.09995V7.99995V9.59995V12.5C14.5 13.0522 14.0523 13.5 13.5 13.5H2.50001C1.94772 13.5 1.50001 13.0522 1.50001 12.5V8.09995L1.5 7.09995V3.44995ZM13.2 3.74995V4.99995H2.8V3.74995H13.2ZM6.24998 7.89997H9.74998C10.109 7.89997 10.4 8.19099 10.4 8.54997C10.4 8.90896 10.109 9.19997 9.74998 9.19997H6.24997C5.89099 9.19997 5.59998 8.90896 5.59998 8.54997C5.59998 8.19099 5.89099 7.89997 6.24998 7.89997Z"
        />
    </IconBase>
);

export default FileDeleteIcon;
