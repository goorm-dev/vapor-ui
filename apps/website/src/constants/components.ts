import avatarData from '../../public/components/avatar.json';
import badgeData from '../../public/components/badge.json';
import boxData from '../../public/components/box.json';
import breadcrumbData from '../../public/components/breadcrumb.json';
import buttonData from '../../public/components/button.json';
import calloutData from '../../public/components/callout.json';
import flexData from '../../public/components/flex.json';
import cardData from '../../public/components/card.json';
import checkboxData from '../../public/components/checkbox.json';
import dialogData from '../../public/components/dialog.json';
import iconButtonData from '../../public/components/icon-button.json';
import navData from '../../public/components/nav.json';
import radioGroupData from '../../public/components/radio-group.json';
import switchData from '../../public/components/switch.json';
import textInputData from '../../public/components/text-input.json';
import textData from '../../public/components/text.json';

// Map of component key -> entire JSON documentation object
export const ComponentDocsMap: Record<string, Record<string, unknown>> = {
    avatar: avatarData,
    badge: badgeData,
    box: boxData,
    breadcrumb: breadcrumbData,
    button: buttonData,
    card: cardData,
    callout: calloutData,
    flex: flexData,
    checkbox: checkboxData,
    'icon-button': iconButtonData,
    nav: navData,
    text: textData,
    'text-input': textInputData,
    dialog: dialogData,
    switch: switchData,
    'radio-group': radioGroupData,
};
