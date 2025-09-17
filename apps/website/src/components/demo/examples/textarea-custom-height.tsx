import { Textarea } from '@vapor-ui/core';

export default function TextareaCustomHeight() {
    return (
        <div className="space-y-4">
            <Textarea
                autoResize
                minHeight={100}
                maxHeight={300}
                placeholder="최소 100px, 최대 300px로 조절됩니다..."
            />
            <Textarea
                autoResize
                minHeight={50}
                maxHeight={200}
                placeholder="최소 50px, 최대 200px로 조절됩니다..."
            />
        </div>
    );
}
