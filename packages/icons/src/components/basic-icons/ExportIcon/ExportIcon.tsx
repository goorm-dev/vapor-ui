import IconBase from '~/components/icon-base';
import type { IconProps } from '~/components/icon-base';

const ExportIcon = (props: IconProps) => (
    <IconBase xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 16 16" {...props}>
        <path
            fill="currentColor"
            fillRule="evenodd"
            d="M9.434 14.66c-.775 0-1.292-.888-1.242-1.662q.008-.123.008-.248a3.75 3.75 0 0 0-3.927-3.746C3.516 9.04 2.67 8.53 2.67 7.772v-5.14a1.3 1.3 0 0 1 1.301-1.3l4.823.003a1.3 1.3 0 0 1 .916.379l3.248 3.235a1.3 1.3 0 0 1 .382.92v7.491a1.3 1.3 0 0 1-1.3 1.3zM12.3 6H9.7a.7.7 0 0 1-.7-.7V2.7z"
            clipRule="evenodd"
        />
        <path
            fill="currentColor"
            d="m4.286 13.328.578.577q.2.2.2.472 0 .27-.2.471a.65.65 0 0 1-.472.2.65.65 0 0 1-.471-.2l-1.72-1.72A.65.65 0 0 1 2 12.655q0-.27.2-.471l1.721-1.721q.2-.2.471-.2t.472.2.2.471-.2.472l-.59.589h2.122q.26 0 .454.194a.68.68 0 0 1 .206.466.65.65 0 0 1-.195.477.65.65 0 0 1-.477.195z"
        />
    </IconBase>
);
export default ExportIcon;
