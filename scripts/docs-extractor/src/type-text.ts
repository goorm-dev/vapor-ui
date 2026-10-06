/**
 * Pure helpers on printed type text, shared by read/ (definitions) and the policy
 * (detailedType, typeRefs) so both write and match types the same way.
 */
import type { ParsedTypeMember } from '#model';

/** The members on one line, function members wrapped so `| undefined` doesn't read as their return type. */
export function joinTypeMembers(members: ParsedTypeMember[]): string {
    if (members.length === 1) return members[0].text;

    return members
        .map((member) => (member.kind === 'function' ? `(${member.text})` : member.text))
        .join(' | ');
}

/** Whether `text` names `typeName` whole: `A.State` is not found in `A.StateX` or `B.A.State`. */
export function mentionsTypeName(text: string, typeName: string): boolean {
    const escaped = typeName.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    return new RegExp(`(?<![\\w.])${escaped}(?![\\w.])`).test(text);
}
