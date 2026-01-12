/**
 * HTML 네이티브 속성 필터링 모듈
 *
 * 기본적으로 HTML 속성들을 필터링하고,
 * --include-html 옵션으로 특정 속성만 포함할 수 있습니다.
 */

export const HTML_NATIVE_ATTRIBUTES = new Set([
    // Core attributes
    'className',
    'style',
    'id',
    'key',
    'ref',

    // Event handlers - Mouse
    'onClick',
    'onDoubleClick',
    'onMouseDown',
    'onMouseUp',
    'onMouseEnter',
    'onMouseLeave',
    'onMouseMove',
    'onMouseOver',
    'onMouseOut',
    'onContextMenu',

    // Event handlers - Keyboard
    'onKeyDown',
    'onKeyUp',
    'onKeyPress',

    // Event handlers - Focus
    'onFocus',
    'onBlur',
    'onFocusCapture',
    'onBlurCapture',

    // Event handlers - Form
    'onChange',
    'onInput',
    'onSubmit',
    'onReset',
    'onInvalid',

    // Event handlers - Other
    'onScroll',
    'onWheel',
    'onCopy',
    'onCut',
    'onPaste',
    'onLoad',
    'onError',

    // Event handlers - Drag
    'onDrag',
    'onDragEnd',
    'onDragEnter',
    'onDragLeave',
    'onDragOver',
    'onDragStart',
    'onDrop',

    // Event handlers - Animation
    'onAnimationEnd',
    'onAnimationStart',
    'onAnimationIteration',
    'onTransitionEnd',

    // Event handlers - Touch
    'onTouchStart',
    'onTouchMove',
    'onTouchEnd',
    'onTouchCancel',

    // Event handlers - Pointer
    'onPointerDown',
    'onPointerUp',
    'onPointerMove',
    'onPointerEnter',
    'onPointerLeave',
    'onPointerOver',
    'onPointerOut',
    'onPointerCancel',

    // Accessibility
    'role',
    'tabIndex',

    // HTML attributes
    'dir',
    'lang',
    'title',
    'hidden',
    'draggable',
    'contentEditable',
    'autoFocus',
    'spellCheck',
    'translate',
    'slot',
    'is',
]);

export function isHtmlAttribute(name: string): boolean {
    if (HTML_NATIVE_ATTRIBUTES.has(name)) return true;
    if (name.startsWith('data-')) return true;
    if (name.startsWith('aria-')) return true;
    if (name.startsWith('on') && name.length > 2 && name[2] === name[2].toUpperCase()) {
        return true; // onSomething 패턴
    }
    return false;
}
