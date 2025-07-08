import type { Meta } from '@storybook/react';

import { Button } from '../button';
import { Box } from './box';

export default { title: 'Box', component: Box } as Meta<typeof Box>;

export const Default = {
    render: () => {
        return (
            <Box
                style={{
                    borderRadius: 'var(--vapor-size-borderRadius-300)',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 'var(--vapor-size-dimension-500)',
                    padding: 'var(--vapor-size-dimension-800)',
                    background: 'var(--vapor-color-gray-500)',
                }}
            >
                <Box style={{ backgroundColor: 'red' }} asChild>
                    <Button>sadfasdf</Button>
                </Box>
                <Box
                    style={{
                        display: 'flex',
                        justifyContent: 'center',
                        alignItems: 'center',
                        padding: 'var(--vapor-size-dimension-900)',
                        backgroundColor: 'blue',
                    }}
                >
                    1
                </Box>
                <Box
                    style={{
                        display: 'flex',
                        justifyContent: 'center',
                        alignItems: 'center',
                        backgroundColor: 'green',
                    }}
                >
                    1
                </Box>
                <Box
                    style={{
                        display: 'flex',
                        justifyContent: 'center',
                        alignItems: 'center',
                        backgroundColor: 'green',
                    }}
                >
                    1
                </Box>
                <Box
                    style={{
                        display: 'flex',
                        justifyContent: 'center',
                        alignItems: 'center',
                        backgroundColor: 'green',
                    }}
                >
                    1
                </Box>
                <Box
                    style={{
                        display: 'flex',
                        justifyContent: 'center',
                        alignItems: 'center',
                        backgroundColor: 'green',
                    }}
                >
                    1
                </Box>
                <Box
                    style={{
                        display: 'flex',
                        justifyContent: 'center',
                        alignItems: 'center',
                        backgroundColor: 'yellow',
                    }}
                >
                    1
                </Box>
                <Box
                    style={{
                        display: 'flex',
                        justifyContent: 'center',
                        alignItems: 'center',
                        backgroundColor: 'black',
                    }}
                >
                    1
                </Box>
                <Box
                    style={{
                        display: 'flex',
                        justifyContent: 'center',
                        alignItems: 'center',
                        backgroundColor: 'black',
                    }}
                >
                    1
                </Box>

                <Box asChild>
                    <a href="asd">as anchor</a>
                </Box>

                <Box
                    style={{
                        display: 'flex',
                        flexDirection: 'row',
                        gap: 'var(--vapor-size-dimension-200)',
                    }}
                >
                    <span style={{ border: '1px solid' }}>row 1</span>
                    <span style={{ border: '1px solid' }}>row 2</span>

                    <Box
                        style={{
                            display: 'flex',
                            flexDirection: 'column',
                            gap: 'var(--vapor-size-dimension-100)',
                        }}
                    >
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
                style={{
                    borderRadius: 'var(--vapor-size-borderRadius-300)',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 'var(--vapor-size-dimension-200)',
                    padding: 'var(--vapor-size-dimension-500)',
                    background: 'var(--vapor-color-gray-500)',
                }}
            >
                <Box style={{ backgroundColor: 'red' }} asChild>
                    <Button>I'm Button</Button>
                </Box>
                <Box
                    style={{
                        display: 'flex',
                        justifyContent: 'center',
                        alignItems: 'center',
                        padding: 'var(--vapor-size-space-900)',
                        backgroundColor: 'blue',
                    }}
                >
                    1
                </Box>
                <Box
                    style={{
                        display: 'flex',
                        justifyContent: 'center',
                        alignItems: 'center',
                        backgroundColor: 'green',
                    }}
                >
                    1
                </Box>
                <Box
                    style={{
                        display: 'flex',
                        justifyContent: 'center',
                        alignItems: 'center',
                        backgroundColor: 'yellow',
                    }}
                >
                    1
                </Box>
                <Box
                    style={{
                        display: 'flex',
                        justifyContent: 'center',
                        alignItems: 'center',
                        backgroundColor: 'black',
                    }}
                >
                    1
                </Box>

                <Box asChild>
                    <a href="asd">as anchor</a>
                </Box>

                <Box
                    style={{
                        display: 'flex',
                        flexDirection: 'row',
                        gap: 'var(--vapor-size-dimension-200)',
                    }}
                >
                    <span style={{ border: '1px solid' }}>row 1</span>
                    <span style={{ border: '1px solid' }}>row 2</span>

                    <Box
                        style={{
                            display: 'flex',
                            flexDirection: 'column',
                            gap: 'var(--vapor-size-dimension-100)',
                        }}
                    >
                        <span style={{ border: '1px solid' }}>row {'>'} nested column 1</span>
                        <span style={{ border: '1px solid' }}>row {'>'} nested column 2</span>
                    </Box>
                </Box>
            </Box>
        );
    },
};
// export const Default = {
//     render: () => {
//         return (
//             <Box
//                 borderRadius="$300"
//                 display="flex"
//                 flexDirection="column"
//                 gap="$500"
//                 padding="$800"
//                 background="$gray-500"
//             >
//                 <Box style={{ backgroundColor: 'red' }} asChild>
//                     <Button>sadfasdf</Button>
//                 </Box>
//                 <Box
//                     display="flex"
//                     justifyContent="center"
//                     alignItems="center"
//                     padding="$900"
//                     style={{ backgroundColor: 'blue' }}
//                 >
//                     1
//                 </Box>
//                 <Box
//                     display="flex"
//                     justifyContent="center"
//                     alignItems="center"
//                     style={{ backgroundColor: 'green' }}
//                 >
//                     1
//                 </Box>
//                 <Box
//                     display="flex"
//                     justifyContent="center"
//                     alignItems="center"
//                     style={{ backgroundColor: 'yellow' }}
//                 >
//                     1
//                 </Box>
//                 <Box
//                     display="flex"
//                     justifyContent="center"
//                     alignItems="center"
//                     style={{ backgroundColor: 'black' }}
//                 >
//                     1
//                 </Box>

//                 <Box asChild>
//                     <a href="asd">as anchor</a>
//                 </Box>

//                 <Box display="flex" flexDirection="row" gap="$200">
//                     <span style={{ border: '1px solid' }}>row 1</span>
//                     <span style={{ border: '1px solid' }}>row 2</span>

//                     <Box display="flex" flexDirection="column" gap="$100">
//                         <span style={{ border: '1px solid' }}>row {'>'} nested column 1</span>
//                         <span style={{ border: '1px solid' }}>row {'>'} nested column 2</span>
//                     </Box>
//                 </Box>
//             </Box>
//         );
//     },
// };

// export const TestBed = {
//     render: () => {
//         return (
//             <Box
//                 borderRadius="$300"
//                 display="flex"
//                 flexDirection="column"
//                 gap="$200"
//                 padding="$500"
//                 background="$gray-500"
//             >
//                 <Box style={{ backgroundColor: 'red' }} asChild>
//                     <Button>I'm Button</Button>
//                 </Box>
//                 <Box
//                     display="flex"
//                     justifyContent="center"
//                     alignItems="center"
//                     padding="$900"
//                     style={{ backgroundColor: 'blue' }}
//                 >
//                     1
//                 </Box>
//                 <Box
//                     display="flex"
//                     justifyContent="center"
//                     alignItems="center"
//                     style={{ backgroundColor: 'green' }}
//                 >
//                     1
//                 </Box>
//                 <Box
//                     display="flex"
//                     justifyContent="center"
//                     alignItems="center"
//                     style={{ backgroundColor: 'yellow' }}
//                 >
//                     1
//                 </Box>
//                 <Box
//                     display="flex"
//                     justifyContent="center"
//                     alignItems="center"
//                     style={{ backgroundColor: 'black' }}
//                 >
//                     1
//                 </Box>

//                 <Box asChild>
//                     <a href="asd">as anchor</a>
//                 </Box>

//                 <Box display="flex" flexDirection="row" gap="$200">
//                     <span style={{ border: '1px solid' }}>row 1</span>
//                     <span style={{ border: '1px solid' }}>row 2</span>

//                     <Box display="flex" flexDirection="column" gap="$100">
//                         <span style={{ border: '1px solid' }}>row {'>'} nested column 1</span>
//                         <span style={{ border: '1px solid' }}>row {'>'} nested column 2</span>
//                     </Box>
//                 </Box>
//             </Box>
//         );
//     },
// };
