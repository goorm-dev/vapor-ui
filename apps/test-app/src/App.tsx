import { $style } from '@vapor-ui/core';

function App() {
    return (
        <div
            className={$style({
                padding: '$400',
                backgroundColor: {
                    sm: '$background-danger-100',
                    md: '$background-warning-100',
                    lg: '$background-success-100',
                    default: '$background-primary-100',
                },
                color: {
                    _hover: '$red-500',
                    sm: '$green-500',
                    md: '$orange-500',
                    lg: '$background-canvas-100',
                },
            })}
        >
            asdf
        </div>
    );
}

export default App;
