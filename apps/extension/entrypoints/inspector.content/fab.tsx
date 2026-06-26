import { Button } from '@vapor-ui/core/button';

interface FabProps {
    onReview: () => void;
}

export const Fab = ({ onReview }: FabProps) => (
    <Button size="lg" style={{ boxShadow: 'var(--vapor-shadow-lg)' }} onClick={onReview}>
        검토
    </Button>
);
