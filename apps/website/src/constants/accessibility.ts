import avatarData from '../../public/components/avatar.json';
import badgeData from '../../public/components/badge.json';
import buttonData from '../../public/components/button.json';
import cardData from '../../public/components/card.json';
import iconButtonData from '../../public/components/icon-button.json';
import navData from '../../public/components/nav.json';
import textInputData from '../../public/components/text-input.json';
import textData from '../../public/components/text.json';

// Map component key -> its accessibility documentation segment.
export const ComponentAccessibilityDataMap: Record<string, unknown> = {
    avatar: avatarData.accessibility,
    badge: badgeData.accessibility,
    button: buttonData.accessibility,
    card: cardData.accessibility,
    'icon-button': iconButtonData.accessibility,
    nav: navData.accessibility,
    text: textData.accessibility,
    'text-input': textInputData.accessibility,
};

// Also re-export raw JSON documents in case consumers need full metadata.
export {
    avatarData,
    badgeData,
    buttonData,
    cardData,
    iconButtonData,
    navData,
    textData,
    textInputData,
};
