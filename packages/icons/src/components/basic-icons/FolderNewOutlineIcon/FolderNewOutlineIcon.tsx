import IconBase from '~/components/icon-base';
import type { IconProps } from '~/components/icon-base';

const FolderNewOutlineIcon = (props: IconProps) => (
    <IconBase xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 16 16" {...props}>
        <path
            fill="currentColor"
            d="M7.795 10.544V9.202H6.453a.52.52 0 1 1 0-1.04h1.342V6.82a.52.52 0 1 1 1.04 0v1.342h1.342a.52.52 0 0 1 0 1.04H8.836v1.342a.52.52 0 0 1-1.04 0"
        />
        <path
            fill="currentColor"
            fillRule="evenodd"
            d="M1.725 12.942q.391.39.942.391h10.667q.55 0 .941-.392.392-.391.392-.941V5.333q0-.55-.392-.942A1.28 1.28 0 0 0 13.334 4H8l-.95-.95a1.32 1.32 0 0 0-.933-.383h-3.45q-.55 0-.942.391A1.28 1.28 0 0 0 1.333 4v8q0 .55.392.941m11.609-7.609V12H2.667V4h3.45L7.45 5.333z"
            clipRule="evenodd"
        />
    </IconBase>
);
export default FolderNewOutlineIcon;
