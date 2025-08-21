import { Flex } from '@vapor-ui/core';

export default function FlexInline() {
    return (
        <div>
            <p className="mb-4 text-sm text-gray-600">
                인라인 플렉스는 다른 요소들과 같은 줄에 배치됩니다.
            </p>
            <div>
                This text is before the flex container.{' '}
                <Flex inline gap="$100" padding="$200" backgroundColor="blue-100" borderRadius="$200">
                    <span style={{ padding: '4px', backgroundColor: '#3b82f6', borderRadius: '2px', color: 'white', fontSize: '12px' }}>
                        Inline
                    </span>
                    <span style={{ padding: '4px', backgroundColor: '#10b981', borderRadius: '2px', color: 'white', fontSize: '12px' }}>
                        Flex
                    </span>
                </Flex>{' '}
                This text is after the flex container.
            </div>
            <div className="mt-4">
                <p className="mb-2 text-sm font-medium">Regular Flex (Block Level)</p>
                <Flex gap="$200" padding="$300" backgroundColor="gray-100" borderRadius="$200">
                    <div style={{ padding: '8px', backgroundColor: '#3b82f6', borderRadius: '4px', color: 'white' }}>Block</div>
                    <div style={{ padding: '8px', backgroundColor: '#10b981', borderRadius: '4px', color: 'white' }}>Flex</div>
                </Flex>
            </div>
        </div>
    );
}