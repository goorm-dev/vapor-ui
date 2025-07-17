import {
    avatarData,
    badgeData,
    buttonData,
    calloutData,
    cardData,
    checkboxData,
    dialogData,
    iconButtonData,
    navData,
    radioGroupData,
    switchData,
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
    checkbox: checkboxData,
    'icon-button': iconButtonData,
    nav: navData,
    text: textData,
    'text-input': textInputData,
    dialog: dialogData,
    switch: switchData,
    'radio-group': radioGroupData,
};
