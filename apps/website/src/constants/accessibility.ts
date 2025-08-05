import avatarData from '../../public/components/avatar.json';
import badgeData from '../../public/components/badge.json';
import buttonData from '../../public/components/button.json';
import calloutData from '../../public/components/callout.json';
import cardData from '../../public/components/card.json';
import checkboxData from '../../public/components/checkbox.json';
import dialogData from '../../public/components/dialog.json';
import iconButtonData from '../../public/components/icon-button.json';
import navData from '../../public/components/nav.json';
import radioGroupData from '../../public/components/radio-group.json';
import switchData from '../../public/components/switch.json';
import textInputData from '../../public/components/text-input.json';
import textData from '../../public/components/text.json';

// Map component key -> its accessibility documentation segment.
export const ComponentAccessibilityDataMap: Record<string, unknown> = {
    badge: badgeData.accessibility,
    button: buttonData.accessibility,
    checkbox: checkboxData.accessibility,
    'icon-button': iconButtonData.accessibility,
    nav: navData.accessibility,
    text: textData.accessibility,
    'text-input': textInputData.accessibility,
    dialog: dialogData.accessibility,
};

// Also re-export raw JSON documents in case consumers need full metadata.
export {
    avatarData,
    badgeData,
    buttonData,
    calloutData,
    cardData,
    checkboxData,
    dialogData,
    iconButtonData,
    navData,
    switchData,
    textData,
    textInputData,
    radioGroupData,
};
