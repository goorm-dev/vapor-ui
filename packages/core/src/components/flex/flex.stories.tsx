import { Flex } from './flex';

export default {
    title: 'Flex',
    component: Flex,
};

export const Default = {
    render: () => {
        return (
            <>
                <div>
                    <p>1. Flex / row direction / gap 050</p>
                    <Flex style={{ backgroundColor: 'lightskyblue' }}>
                        <div style={{ backgroundColor: 'red', width: '100px', height: '100px' }} />
                        <div style={{ backgroundColor: 'blue', width: '100px', height: '100px' }} />
                        <div
                            style={{ backgroundColor: 'green', width: '100px', height: '100px' }}
                        />
                    </Flex>
                </div>

                <div>
                    <p>2. Inline Flex / column direction / gap 300</p>
                    <Flex
                        inline
                        style={{
                            flexDirection: 'column',
                            gap: 'var(--vapor-size-dimension-300)',
                            padding: 'var(--vapor-size-dimension-150)',
                            backgroundColor: 'lightgray',
                        }}
                    >
                        <div style={{ backgroundColor: 'red', width: '100px', height: '100px' }} />
                        <div style={{ backgroundColor: 'blue', width: '100px', height: '100px' }} />
                        <div
                            style={{ backgroundColor: 'green', width: '100px', height: '100px' }}
                        />
                    </Flex>
                </div>
            </>
        );
    },
};

export const TestBed = {
    render: () => {
        return (
            <>
                <div>
                    <p>1. Flex / row direction / gap 050</p>
                    <Flex
                        style={{
                            gap: 'var(--vapor-size-dimension-050)',
                            padding: 'var(--vapor-size-dimension-150)',
                            backgroundColor: 'lightskyblue',
                        }}
                    >
                        <div style={{ backgroundColor: 'red', width: '100px', height: '100px' }} />
                        <div style={{ backgroundColor: 'blue', width: '100px', height: '100px' }} />
                        <div
                            style={{ backgroundColor: 'green', width: '100px', height: '100px' }}
                        />
                    </Flex>
                </div>

                <div>
                    <p>2. Inline Flex / column direction / gap 300</p>
                    <Flex
                        inline
                        style={{
                            gap: 'var(--vapor-size-dimension-300)',
                            padding: 'var(--vapor-size-dimension-150)',
                            flexDirection: 'column',
                            backgroundColor: 'lightgray',
                        }}
                    >
                        <div style={{ backgroundColor: 'red', width: '100px', height: '100px' }} />
                        <div style={{ backgroundColor: 'blue', width: '100px', height: '100px' }} />
                        <div
                            style={{ backgroundColor: 'green', width: '100px', height: '100px' }}
                        />
                    </Flex>
                </div>
            </>
        );
    },
};
