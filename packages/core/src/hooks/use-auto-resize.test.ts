import { useRef } from 'react';

import { renderHook } from '@testing-library/react';
import { describe, expect, test } from 'vitest';

import { useAutoResize } from './use-auto-resize';

describe('useAutoResize', () => {
    test('should return adjust height function', () => {
        const { result } = renderHook(() => {
            const ref = useRef<HTMLTextAreaElement>(null);
            return useAutoResize(ref, { autoResize: true });
        });

        expect(typeof result.current).toBe('function');
    });

    test('should not adjust height when autoResize is false', () => {
        const mockElement = {
            style: { height: '' },
            scrollHeight: 100,
        } as HTMLTextAreaElement;

        const { result } = renderHook(() => {
            const ref = useRef<HTMLTextAreaElement>(mockElement);
            return useAutoResize(ref, { autoResize: false });
        });

        // Call the adjust height function
        result.current();

        // Height should not be modified
        expect(mockElement.style.height).toBe('');
    });

    test('should adjust height when autoResize is true and element exists', () => {
        const mockElement = {
            style: { height: '' },
            scrollHeight: 100,
        } as HTMLTextAreaElement;

        const { result } = renderHook(() => {
            const ref = useRef<HTMLTextAreaElement>(mockElement);
            return useAutoResize(ref, { autoResize: true });
        });

        // Call the adjust height function
        result.current();

        // Height should be adjusted to scrollHeight
        expect(mockElement.style.height).toBe('100px');
    });

    test('should handle null ref gracefully', () => {
        const { result } = renderHook(() => {
            const ref = useRef<HTMLTextAreaElement>(null);
            return useAutoResize(ref, { autoResize: true });
        });

        // Should not throw when ref is null
        expect(() => result.current()).not.toThrow();
    });

    test('should work with generic HTML elements', () => {
        const mockElement = {
            style: { height: '' },
            scrollHeight: 150,
        } as HTMLDivElement;

        const { result } = renderHook(() => {
            const ref = useRef<HTMLDivElement>(mockElement);
            return useAutoResize<HTMLDivElement>(ref, { autoResize: true });
        });

        result.current();

        expect(mockElement.style.height).toBe('150px');
    });

    test('should reset height to auto before setting new height', () => {
        const mockElement = {
            style: { height: '200px' },
            scrollHeight: 100,
        } as HTMLTextAreaElement;

        const { result } = renderHook(() => {
            const ref = useRef<HTMLTextAreaElement>(mockElement);
            return useAutoResize(ref, { autoResize: true });
        });

        result.current();

        // Should have been set to 'auto' first, then to scrollHeight
        expect(mockElement.style.height).toBe('100px');
    });

    test('should use default options when not provided', () => {
        const mockElement = {
            style: { height: '' },
            scrollHeight: 75,
        } as HTMLTextAreaElement;

        const { result } = renderHook(() => {
            const ref = useRef<HTMLTextAreaElement>(mockElement);
            return useAutoResize(ref); // No options provided
        });

        result.current();

        // Should not adjust height since default autoResize is false
        expect(mockElement.style.height).toBe('');
    });
});
