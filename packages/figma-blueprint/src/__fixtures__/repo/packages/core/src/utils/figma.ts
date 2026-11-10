import figma from 'figma';
import type { InstanceHandle } from 'figma';

export const pick = (name: string, options: Record<string, string>): string =>
    (figma.selectedInstance as InstanceHandle).getEnum(name, options);
