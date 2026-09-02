// @vitest-environment node
import { describe, expect, it } from 'vitest';

import {
    isNamedInstance,
    isParen,
    lowerFirst,
    stripParens,
    stripPropId,
    toKebab,
    toPascal,
} from '../naming.mjs';

describe('naming', () => {
    it('toPascal', () => {
        expect(toPascal('Dialog')).toBe('Dialog');
        expect(toPascal('alert dialog')).toBe('AlertDialog');
        expect(toPascal('alert-dialog')).toBe('AlertDialog');
        expect(toPascal('AlertDialog')).toBe('AlertDialog');
    });

    it('toKebab', () => {
        expect(toKebab('Dialog')).toBe('dialog');
        expect(toKebab('AlertDialog')).toBe('alert-dialog');
        expect(toKebab('Alert Dialog')).toBe('alert-dialog');
        expect(toKebab('alert_dialog')).toBe('alert-dialog');
    });

    it('lowerFirst', () => {
        expect(lowerFirst('Assistive')).toBe('assistive');
        expect(lowerFirst('action')).toBe('action');
        expect(lowerFirst('')).toBe('');
    });

    it('isParen / stripParens', () => {
        expect(isParen('(Popup)')).toBe(true);
        expect(isParen('Popup')).toBe(false);
        expect(isParen('(has footer)')).toBe(true);
        expect(stripParens('(Popup)')).toBe('Popup');
        expect(stripParens('Popup')).toBe('Popup');
    });

    it('isNamedInstance: 영문자 또는 ( 로 시작해야 한다', () => {
        expect(isNamedInstance('Assistive')).toBe(true);
        expect(isNamedInstance('(Header)')).toBe(true);
        expect(isNamedInstance('💙Button')).toBe(false);
        expect(isNamedInstance('🟨Button/SlotLayer')).toBe(false);
        expect(isNamedInstance('❤️SlotIcon')).toBe(false);
        expect(isNamedInstance('1Thing')).toBe(false);
        expect(isNamedInstance('')).toBe(false);
    });

    it('stripPropId', () => {
        expect(stripPropId('title#2328:0')).toBe('title');
        expect(stripPropId('(content)#2260:77')).toBe('(content)');
        expect(stripPropId('size')).toBe('size');
    });
});
