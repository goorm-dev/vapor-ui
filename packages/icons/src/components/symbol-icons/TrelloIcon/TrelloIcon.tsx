import IconBase, { type IconType } from '~/components/icon-base';

const TrelloIcon: IconType = (props) => (
    <IconBase viewBox="0 0 16 16" xmlns="http://www.w3.org/2000/svg" {...props}>
        <path
            fillRule="evenodd"
            clipRule="evenodd"
            d="M14 0H2C0.895431 0 0 0.895431 0 2V14C0 15.1046 0.895431 16 2 16H14C15.1046 16 16 15.1046 16 14V2C16 0.895431 15.1046 0 14 0ZM12.96 2.08H10C9.46981 2.08 9.04 2.50981 9.04 3.04V8.12C9.04 8.65019 9.46981 9.08 10 9.08H12.96C13.4902 9.08 13.92 8.65019 13.92 8.12V3.04C13.92 2.50981 13.4902 2.08 12.96 2.08ZM3.04 2.08H6C6.53019 2.08 6.96 2.50981 6.96 3.04V12.12C6.96 12.6502 6.53019 13.08 6 13.08H3.04C2.50981 13.08 2.08 12.6502 2.08 12.12V3.04C2.08 2.50981 2.50981 2.08 3.04 2.08Z"
        />
    </IconBase>
);

export default TrelloIcon;
