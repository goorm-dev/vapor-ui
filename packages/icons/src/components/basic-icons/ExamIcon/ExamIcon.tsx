import IconBase from '~/components/icon-base';
import type { IconProps } from '~/components/icon-base';

const ExamIcon = (props: IconProps) => (
    <IconBase xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 16 16" {...props}>
        <path
            fill="currentColor"
            d="M10.4 14.4h2.8q.495 0 .847-.352.353-.353.353-.848v-2.8a1.68 1.68 0 0 1-1.133-.492A1.5 1.5 0 0 1 12.8 8.8q0-.65.467-1.108.466-.459 1.133-.492V4.4q0-.495-.353-.847A1.16 1.16 0 0 0 13.2 3.2h-2.8a1.55 1.55 0 0 0-.463-1.133A1.54 1.54 0 0 0 8.804 1.6q-.67 0-1.137.464A1.54 1.54 0 0 0 7.2 3.2H4.4q-.495 0-.848.353A1.16 1.16 0 0 0 3.2 4.4v2.8a1.55 1.55 0 0 0-1.133.463A1.54 1.54 0 0 0 1.6 8.796q0 .67.464 1.137.465.467 1.136.467v2.8q0 .495.352.848.353.352.848.352h2.8q.033-.666.49-1.133a1.5 1.5 0 0 1 1.108-.467q.653 0 1.11.467.459.466.492 1.133"
        />
    </IconBase>
);
export default ExamIcon;
