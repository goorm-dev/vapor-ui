import avatarData from '../../public/components/avatar.json';
import badgeData from '../../public/components/badge.json';
import boxData from '../../public/components/box.json';
import breadcrumbData from '../../public/components/breadcrumb.json';
import buttonData from '../../public/components/button.json';
import calloutData from '../../public/components/callout.json';
import cardData from '../../public/components/card.json';
import checkboxData from '../../public/components/checkbox.json';
import dialogData from '../../public/components/dialog.json';
import flexData from '../../public/components/flex.json';
import gridData from '../../public/components/grid.json';
import hStackData from '../../public/components/h-stack.json';
import iconButtonData from '../../public/components/icon-button.json';
import menuData from '../../public/components/menu.json';
import navigationMenuData from '../../public/components/navigation-menu.json';
import radioGroupData from '../../public/components/radio-group.json';
import switchData from '../../public/components/switch.json';
import textInputData from '../../public/components/text-input.json';
import textData from '../../public/components/text.json';
import tooltipData from '../../public/components/tooltip.json';
import vStackData from '../../public/components/v-stack.json';

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
    grid: gridData,
    'h-stack': hStackData,
    'v-stack': vStackData,
    checkbox: checkboxData,
    'icon-button': iconButtonData,
    menu: menuData,
    'navigation-menu': navigationMenuData,
    text: textData,
    'text-input': textInputData,
    dialog: dialogData,
    switch: switchData,
    'radio-group': radioGroupData,
    tooltip: tooltipData,
};
