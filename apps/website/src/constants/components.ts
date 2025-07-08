import {
    avatarData,
    badgeData,
    buttonData,
    calloutData,
    cardData,
    iconButtonData,
    navData,
    textData,
    textInputData,
} from './accessibility';

// Map of component key -> entire JSON documentation object
export const ComponentDocsMap: Record<string, Record<string, unknown>> = {
    avatar: avatarData,
    badge: badgeData,
    button: buttonData,
    card: cardData,
    callout: calloutData,
    'icon-button': iconButtonData,
    nav: navData,
    text: textData,
    'text-input': textInputData,
};
