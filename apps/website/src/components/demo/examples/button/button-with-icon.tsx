import { Button, HStack } from '@vapor-ui/core';
import { CheckCircleIcon, ChevronRightOutlineIcon } from '@vapor-ui/icons';

export default function ButtonWithIcon() {
    return (
        <HStack $styles={{ gap: '$100' }}>
            <Button>
                <CheckCircleIcon />
                Complete
            </Button>
            <Button variant="outline">
                Next
                <ChevronRightOutlineIcon />
            </Button>
        </HStack>
    );
}
