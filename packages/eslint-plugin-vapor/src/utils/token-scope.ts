import type { Scope } from '~/data/property-scope-map';

export function scopeFromTokenName(name: string): Scope | 'primitive' | null {
  if (!name.startsWith('--vapor-')) return null;
  const segments = name.slice('--vapor-'.length).split('-');
  if (segments[0] === 'color') {
    const second = segments[1];
    if (second === 'foreground' || second === 'background' || second === 'border') {
      return second;
    }
    return 'primitive';
  }
  if (segments[0] === 'size') {
    const second = segments[1];
    if (second === 'dimension' || second === 'space' || second === 'borderRadius') {
      return second;
    }
  }
  if (segments[0] === 'shadow') return 'shadow';
  return null;
}
