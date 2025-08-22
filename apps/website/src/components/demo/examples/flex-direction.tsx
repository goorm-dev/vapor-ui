import { Flex } from '@vapor-ui/core';

export default function FlexDirection() {
    return (
        <div className="flex flex-col gap-6">
            <div>
                <h4 className="mb-2 text-sm font-medium">Row (가로 방향)</h4>
                <Flex
                    flexDirection="row"
                    gap="$200"
                    padding="$300"
                    backgroundColor="gray-100"
                    borderRadius="$200"
                >
                    <div
                        style={{
                            padding: '8px',
                            backgroundColor: '#3b82f6',
                            borderRadius: '4px',
                            color: 'white',
                        }}
                    >
                        1
                    </div>
                    <div
                        style={{
                            padding: '8px',
                            backgroundColor: '#10b981',
                            borderRadius: '4px',
                            color: 'white',
                        }}
                    >
                        2
                    </div>
                    <div
                        style={{
                            padding: '8px',
                            backgroundColor: '#f59e0b',
                            borderRadius: '4px',
                            color: 'white',
                        }}
                    >
                        3
                    </div>
                </Flex>
            </div>

            <div>
                <h4 className="mb-2 text-sm font-medium">Column (세로 방향)</h4>
                <Flex
                    flexDirection="column"
                    gap="$200"
                    padding="$300"
                    backgroundColor="gray-100"
                    borderRadius="$200"
                >
                    <div
                        style={{
                            padding: '8px',
                            backgroundColor: '#3b82f6',
                            borderRadius: '4px',
                            color: 'white',
                        }}
                    >
                        1
                    </div>
                    <div
                        style={{
                            padding: '8px',
                            backgroundColor: '#10b981',
                            borderRadius: '4px',
                            color: 'white',
                        }}
                    >
                        2
                    </div>
                    <div
                        style={{
                            padding: '8px',
                            backgroundColor: '#f59e0b',
                            borderRadius: '4px',
                            color: 'white',
                        }}
                    >
                        3
                    </div>
                </Flex>
            </div>

            <div>
                <h4 className="mb-2 text-sm font-medium">Row Reverse (가로 역순)</h4>
                <Flex
                    flexDirection="row-reverse"
                    gap="$200"
                    padding="$300"
                    backgroundColor="gray-100"
                    borderRadius="$200"
                >
                    <div
                        style={{
                            padding: '8px',
                            backgroundColor: '#3b82f6',
                            borderRadius: '4px',
                            color: 'white',
                        }}
                    >
                        1
                    </div>
                    <div
                        style={{
                            padding: '8px',
                            backgroundColor: '#10b981',
                            borderRadius: '4px',
                            color: 'white',
                        }}
                    >
                        2
                    </div>
                    <div
                        style={{
                            padding: '8px',
                            backgroundColor: '#f59e0b',
                            borderRadius: '4px',
                            color: 'white',
                        }}
                    >
                        3
                    </div>
                </Flex>
            </div>
        </div>
    );
}
