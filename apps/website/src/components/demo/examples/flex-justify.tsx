import { Flex } from '@vapor-ui/core';

export default function FlexJustify() {
    return (
        <div className="flex flex-col gap-4">
            <div>
                <h4 className="mb-2 text-sm font-medium">Flex Start</h4>
                <Flex
                    justifyContent="flex-start"
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
                        A
                    </div>
                    <div
                        style={{
                            padding: '8px',
                            backgroundColor: '#10b981',
                            borderRadius: '4px',
                            color: 'white',
                        }}
                    >
                        B
                    </div>
                </Flex>
            </div>

            <div>
                <h4 className="mb-2 text-sm font-medium">Center</h4>
                <Flex
                    justifyContent="center"
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
                        A
                    </div>
                    <div
                        style={{
                            padding: '8px',
                            backgroundColor: '#10b981',
                            borderRadius: '4px',
                            color: 'white',
                        }}
                    >
                        B
                    </div>
                </Flex>
            </div>

            <div>
                <h4 className="mb-2 text-sm font-medium">Flex End</h4>
                <Flex
                    justifyContent="flex-end"
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
                        A
                    </div>
                    <div
                        style={{
                            padding: '8px',
                            backgroundColor: '#10b981',
                            borderRadius: '4px',
                            color: 'white',
                        }}
                    >
                        B
                    </div>
                </Flex>
            </div>

            <div>
                <h4 className="mb-2 text-sm font-medium">Space Between</h4>
                <Flex
                    justifyContent="space-between"
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
                        A
                    </div>
                    <div
                        style={{
                            padding: '8px',
                            backgroundColor: '#10b981',
                            borderRadius: '4px',
                            color: 'white',
                        }}
                    >
                        B
                    </div>
                    <div
                        style={{
                            padding: '8px',
                            backgroundColor: '#f59e0b',
                            borderRadius: '4px',
                            color: 'white',
                        }}
                    >
                        C
                    </div>
                </Flex>
            </div>
        </div>
    );
}
