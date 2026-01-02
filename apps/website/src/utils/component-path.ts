/**
 * Component path utilities for references folder
 */
import { kebabToPascal } from './string';

/**
 * Parses componentName into folder and filename
 * @example "avatar-root" -> { folder: "Avatar", filename: "root" }
 * @example "button" -> { folder: "Button", filename: "Button" }
 */
export const parseComponentName = (componentName: string): { folder: string; filename: string } => {
    const parts = componentName.split('-');
    const folder = kebabToPascal(parts[0]);

    if (parts.length === 1) {
        // 단일 컴포넌트: "button" -> Button/Button
        return { folder, filename: folder };
    }

    // 복합 컴포넌트: "avatar-root" -> Avatar/root
    const filename = parts.slice(1).join('-');
    return { folder, filename };
};
