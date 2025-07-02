import IconBase, { type IconType } from '~/components/icon-base';

const DotIcon: IconType = (props) => (
    <IconBase viewBox="0 0 16 16" xmlns="http://www.w3.org/2000/svg" {...props}>
        <circle cx="8" cy="8" r="4" />
    </IconBase>
);

export default DotIcon;
