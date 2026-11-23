import IconBase from '~/components/icon-base';
import type { IconProps } from '~/components/icon-base';
import { useIconId } from '~/components/use-icon-id';

const ImagePackOutlineIcon = (props: IconProps) => {
    const id = useIconId('vapor-icons-mono-ImagePackOutlineIcon');
    return (
        <IconBase xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 16 16" {...props}>
            <mask id={`${id}__a`} fill="#fff">
                <path d="M7.392 1.377 5.517 5.504l-4.12 1.878a.665.665 0 0 0 0 1.216l4.12 1.879 1.875 4.126c.238.53.978.53 1.216 0l1.875-4.126 4.12-1.879a.665.665 0 0 0 0-1.216l-4.12-1.878-1.875-4.127c-.238-.503-.978-.503-1.216 0" />
            </mask>
            <path
                stroke="currentColor"
                strokeWidth={2.25}
                d="M7.392 1.377 5.517 5.504l-4.12 1.878a.665.665 0 0 0 0 1.216l4.12 1.879 1.875 4.126c.238.53.978.53 1.216 0l1.875-4.126 4.12-1.879a.665.665 0 0 0 0-1.216l-4.12-1.878-1.875-4.127c-.238-.503-.978-.503-1.216 0Z"
                mask={`url(#${id}__a)`}
            />
        </IconBase>
    );
};
export default ImagePackOutlineIcon;
