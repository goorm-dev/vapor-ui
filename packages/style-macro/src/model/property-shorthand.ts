export const PROPERTY_SHORT: Record<string, string> = {
    padding: 'p',
    paddingTop: 'pt',
    paddingBottom: 'pb',
    paddingLeft: 'pl',
    paddingRight: 'pr',
    paddingX: 'px',
    paddingY: 'py',
    margin: 'm',
    marginTop: 'mt',
    marginBottom: 'mb',
    marginLeft: 'ml',
    marginRight: 'mr',
    marginX: 'mx',
    marginY: 'my',
    gap: 'gap',
    width: 'w',
    height: 'h',
    minWidth: 'minw',
    minHeight: 'minh',
    maxWidth: 'maxw',
    maxHeight: 'maxh',
    backgroundColor: 'bg',
    color: 'color',
    borderColor: 'bc',
    borderRadius: 'br',
    boxShadow: 'sh',
    opacity: 'op',
    display: 'd',
    position: 'pos',
    overflow: 'ov',
};

export function shortenProperty(property: string): string {
    const known = PROPERTY_SHORT[property];
    if (known) return known;

    return property.replace(/([A-Z])/g, '-$1').toLowerCase();
}
