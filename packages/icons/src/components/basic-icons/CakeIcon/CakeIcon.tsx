import IconBase from '~/components/icon-base';
import type { IconProps } from '~/components/icon-base';

const CakeIcon = (props: IconProps) => (
    <IconBase xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 16 16" {...props}>
        <path
            fill="currentColor"
            d="M2.658 15.117a.86.86 0 0 1-.635-.256.86.86 0 0 1-.256-.635V11.11q0-.551.392-.943.393-.393.944-.393h9.794q.55 0 .944.393.392.391.392.943v3.116a.86.86 0 0 1-.256.635.86.86 0 0 1-.635.256zm.89-6.678V6.213q0-.557.392-.946.392-.39.944-.39h2.448V3.875a2.1 2.1 0 0 1-.491-.463q-.177-.241-.177-.664 0-.264.093-.496t.296-.434l.71-.71Q7.794 1.074 8 1q.075 0 .241.093l.722.721q.205.207.29.438.083.232.083.496 0 .423-.177.664a2.1 2.1 0 0 1-.491.463v1.002h2.467q.543 0 .93.392t.387.944v2.226z"
        />
    </IconBase>
);
export default CakeIcon;
