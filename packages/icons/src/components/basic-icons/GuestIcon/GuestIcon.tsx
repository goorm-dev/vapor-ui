import IconBase from '~/components/icon-base';
import type { IconProps } from '~/components/icon-base';

const GuestIcon = (props: IconProps) => (
    <IconBase xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 16 16" {...props}>
        <path
            fill="currentColor"
            fillRule="evenodd"
            d="M10.608 8.402c-.674.13-1.348-.103-1.723-.547-.19-.223-.01-.522.277-.578l2.221-.432c.256-.05.52.11.487.369-.072.562-.562 1.05-1.262 1.188m-5.216 0c-.7-.137-1.19-.626-1.261-1.189-.033-.258.231-.417.486-.368l2.22.432c.287.056.467.355.278.578-.375.444-1.05.677-1.723.547m8.607-1.451c0-3.153-2.689-5.461-5.998-5.45C4.692 1.49 2 3.798 2 6.95l.01 6.738a.5.5 0 0 0 .725.445l.985-.498a.5.5 0 0 1 .438-.006l1.636.767a.5.5 0 0 0 .439-.007l1.483-.753a.5.5 0 0 1 .44-.007l1.63.767a.5.5 0 0 0 .44-.007l1.482-.753a.5.5 0 0 1 .44-.007l1.14.536a.5.5 0 0 0 .712-.453z"
            clipRule="evenodd"
        />
    </IconBase>
);
export default GuestIcon;
