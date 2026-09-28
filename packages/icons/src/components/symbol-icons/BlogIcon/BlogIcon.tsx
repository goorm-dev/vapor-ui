import IconBase from '~/components/icon-base';
import type { IconProps } from '~/components/icon-base';

const BlogIcon = (props: IconProps) => (
    <IconBase xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 16 16" {...props}>
        <path
            fill="currentColor"
            fillRule="evenodd"
            d="M8.714 14c2.715 0 4.49-1.102 4.49-3.286v-.081a2.92 2.92 0 0 0-2.245-2.94 2.82 2.82 0 0 0 1.572-2.591C12.53 3.224 11.02 2 8.57 2H3v12zm1.148-8.348c0-.776-.597-1.214-1.691-1.214H5.664v2.448H8.05c1.095 0 1.811-.378 1.811-1.234M5.664 9.015h2.945c1.313 0 1.91.497 1.91 1.313 0 .875-.697 1.273-1.83 1.273H5.663z"
            clipRule="evenodd"
        />
    </IconBase>
);
export default BlogIcon;
