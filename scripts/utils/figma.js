import { camelCase } from 'lodash-es';

const svgToIconComponent = (svgDom) =>
    svgDom
        .toString()
        .replace(/(?<=<svg[^>]*)\s+(width|height)="[^"]*"/g, '')
        .replace(/^\<svg/gm, '<IconBase')
        .replace(/\<\/svg\>/gm, '</IconBase>')
        .replace(/\s\w*:\w*="/gm, (w) => ' ' + camelCase(w) + '="')
        .replace(/\s\w*-\w*="/gm, (w) => ' ' + camelCase(w) + '="')
        .replace(/>/, ' {...props} >');

const remakeMaskStyle = (IconComponent) => {
    const matches = IconComponent.matchAll(/(style)="(.*?)"/gi);
    for (const match of matches) {
        const splitColon = match[2].split(':');
        const splitHypen = splitColon[0].split('-');
        const key = splitHypen
            .map((word, index) => {
                if (index === 0) return word;
                word = word.charAt(0).toUpperCase() + word.slice(1);
                return word;
            })
            .join('');
        const value = splitColon[1];
        const styleReplace = `${match[1]}={{ ${key}: "${value}" }}`;
        IconComponent = IconComponent.replace(match[0], styleReplace);
    }
    return IconComponent;
};

const makeFlexibleColorIcon = (IconComponent) =>
    IconComponent.replace(/fill="black"/g, '').replace(/fill="none"/g, '');

export { svgToIconComponent, remakeMaskStyle, makeFlexibleColorIcon };
