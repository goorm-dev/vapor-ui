import { Flex } from '.';

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
                    <Flex gap="$050" padding="$150" style={{ backgroundColor: 'lightskyblue' }}>
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
                        gap="$300"
                        padding="$150"
                        flexDirection="column"
                        style={{ backgroundColor: 'lightgray' }}
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
                    <Flex gap="$050" padding="$150" style={{ backgroundColor: 'lightskyblue' }}>
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
                        gap="$300"
                        padding="$150"
                        flexDirection="column"
                        style={{ backgroundColor: 'lightgray' }}
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
