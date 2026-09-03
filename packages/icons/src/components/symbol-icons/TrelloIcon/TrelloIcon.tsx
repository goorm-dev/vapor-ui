import IconBase from '~/components/icon-base';
import type { IconProps } from '~/components/icon-base';

const TrelloIcon = (props: IconProps) => (
    <IconBase xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 16 16" {...props}>
        <path
            fill="currentColor"
            fillRule="evenodd"
            d="M14 0H2a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V2a2 2 0 0 0-2-2m-1.04 2.08H10a.96.96 0 0 0-.96.96v5.08c0 .53.43.96.96.96h2.96c.53 0 .96-.43.96-.96V3.04a.96.96 0 0 0-.96-.96m-9.92 0H6c.53 0 .96.43.96.96v9.08c0 .53-.43.96-.96.96H3.04a.96.96 0 0 1-.96-.96V3.04c0-.53.43-.96.96-.96"
            clipRule="evenodd"
        />
    </IconBase>
);
export default TrelloIcon;
