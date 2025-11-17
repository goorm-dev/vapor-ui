// @ts-nocheck
import { useState } from 'react';

export const Component = () => {
    const [count, setCount] = useState(0);
    return <div>{count}</div>;
};
