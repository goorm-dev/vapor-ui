import IconBase from '~/components/icon-base';
import type { IconProps } from '~/components/icon-base';

const FolderNewOutlineIcon = (props: IconProps) => (
    <IconBase xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 16 16" {...props}>
        <path
            fill="currentColor"
            d="M7.462 10.544V9.202H6.119a.52.52 0 0 1 0-1.04h1.343V6.82a.52.52 0 1 1 1.04 0v1.342h1.342a.52.52 0 0 1 0 1.04H8.501v1.342a.52.52 0 0 1-1.04 0"
        />
        <path
            fill="currentColor"
            fillRule="evenodd"
            d="M1.392 12.942q.391.39.941.391H13q.55 0 .942-.392.39-.391.391-.941V5.333q0-.55-.391-.942A1.28 1.28 0 0 0 13 4H7.667l-.95-.95a1.32 1.32 0 0 0-.933-.383h-3.45q-.55 0-.942.391A1.28 1.28 0 0 0 1 4v8q0 .55.392.941M13 5.333V12H2.333V4h3.45l1.334 1.333z"
            clipRule="evenodd"
        />
    </IconBase>
);
export default FolderNewOutlineIcon;
