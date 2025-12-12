import type { Meta } from '@storybook/react-vite';

import { Button } from '../button';
import { Box } from './box';

export default { title: 'Box', component: Box } as Meta<typeof Box>;

export const Default = {
    render: () => {
        return (
            <Box
                borderRadius="$300"
                display="flex"
                flexDirection="column"
                gap="$500"
                padding="$800"
                backgroundColor="$gray-500"
                className="te"
            >
                <Box style={{ backgroundColor: 'red' }} render={<Button>sadfasdf</Button>} />
                <Box
                    display="flex"
                    justifyContent="center"
                    alignItems="center"
                    padding="$900"
                    style={{ backgroundColor: 'blue' }}
                >
                    1
                </Box>
                <Box
                    display="flex"
                    justifyContent="center"
                    alignItems="center"
                    style={{ backgroundColor: 'green' }}
                >
                    1
                </Box>
                <Box
                    display="flex"
                    justifyContent="center"
                    alignItems="center"
                    style={{ backgroundColor: 'yellow' }}
                >
                    1
                </Box>
                <Box
                    display="flex"
                    justifyContent="center"
                    alignItems="center"
                    style={{ backgroundColor: 'black' }}
                >
                    1
                </Box>

                <Box render={<a href="asd">as anchor</a>} />

                <Box display="flex" flexDirection="row" gap="$200">
                    <span style={{ border: '1px solid' }}>row 1</span>
                    <span style={{ border: '1px solid' }}>row 2</span>

                    <Box display="flex" flexDirection="column" gap="$100">
                        <span style={{ border: '1px solid' }}>row {'>'} nested column 1</span>
                        <span style={{ border: '1px solid' }}>row {'>'} nested column 2</span>
                    </Box>
                </Box>
            </Box>
        );
    },
};

export const TestBed = {
    render: () => {
        return (
            <Box
                borderRadius="$300"
                display="flex"
                flexDirection="column"
                gap="$200"
                padding="$500"
                backgroundColor="$gray-500"
            >
                <Box backgroundColor="$red-500" render={<Button>I'm Button</Button>} />
                <Box
                    display="flex"
                    justifyContent="center"
                    alignItems="center"
                    padding="$900"
                    style={{ backgroundColor: 'blue' }}
                >
                    1
                </Box>
                <Box
                    display="flex"
                    justifyContent="center"
                    alignItems="center"
                    style={{ backgroundColor: 'green' }}
                >
                    1
                </Box>
                <Box
                    display="flex"
                    justifyContent="center"
                    alignItems="center"
                    style={{ backgroundColor: 'yellow' }}
                >
                    1
                </Box>
                <Box
                    display="flex"
                    justifyContent="center"
                    alignItems="center"
                    style={{ backgroundColor: 'black' }}
                >
                    1
                </Box>

                <Box render={<a href="asd">as anchor</a>} />

                <Box display="flex" flexDirection="row" gap="$200">
                    <span style={{ border: '1px solid' }}>row 1</span>
                    <span style={{ border: '1px solid' }}>row 2</span>

                    <Box display="flex" flexDirection="column" gap="$100">
                        <span style={{ border: '1px solid' }}>row {'>'} nested column 1</span>
                        <span style={{ border: '1px solid' }}>row {'>'} nested column 2</span>
                    </Box>
                </Box>
            </Box>
        );
    },
};
