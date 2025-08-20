import { Button } from '@vapor-ui/core';
import { CheckCircleIcon, ChevronRightOutlineIcon } from '@vapor-ui/icons';

export default function ButtonWithIcon() {
    return (
        <div className="flex items-center gap-2">
            <Button>
                <CheckCircleIcon />
                Complete
            </Button>
            <Button variant="outline">
                Next
                <ChevronRightOutlineIcon />
            </Button>
        </div>
    );
}