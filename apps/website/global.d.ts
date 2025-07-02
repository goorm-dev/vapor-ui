declare module '*.svg' {
    import type * as React from 'react';
    const ReactComponent: React.FC<React.SVGProps<SVGSVGElement>>;
    export default ReactComponent;
}
declare module '*.svg?url' {
    const src: string;
    export default src;
}
