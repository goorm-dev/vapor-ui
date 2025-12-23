import avatarData from '../../public/components/avatar.json';
import badgeData from '../../public/components/badge.json';
import boxData from '../../public/components/box.json';
import breadcrumbData from '../../public/components/breadcrumb.json';
import buttonData from '../../public/components/button.json';
import calloutData from '../../public/components/callout.json';
import cardData from '../../public/components/card.json';
import checkboxData from '../../public/components/checkbox.json';
import collapsibleData from '../../public/components/collapsible.json';
import dialogData from '../../public/components/dialog.json';
import fieldData from '../../public/components/field.json';
import flexData from '../../public/components/flex.json';
import gridData from '../../public/components/grid.json';
import hStackData from '../../public/components/h-stack.json';
import iconButtonData from '../../public/components/icon-button.json';
import inputGroupData from '../../public/components/input-group.json';
import menuData from '../../public/components/menu.json';
import multiSelectData from '../../public/components/multi-select.json';
import navigationMenuData from '../../public/components/navigation-menu.json';
import paginationData from '../../public/components/pagination.json';
import popoverData from '../../public/components/popover.json';
import radioCardData from '../../public/components/radio-card.json';
import radioGroupData from '../../public/components/radio-group.json';
import radioData from '../../public/components/radio.json';
import selectData from '../../public/components/select.json';
import sheetData from '../../public/components/sheet.json';
import switchData from '../../public/components/switch.json';
import tableData from '../../public/components/table.json';
import tabsData from '../../public/components/tabs.json';
import textInputData from '../../public/components/text-input.json';
import textData from '../../public/components/text.json';
import textareaData from '../../public/components/textarea.json';
import tooltipData from '../../public/components/tooltip.json';
import vStackData from '../../public/components/v-stack.json';

// FIXME: TextInput, Switch, Checkbox, RadioGroup, Radio 컴포넌트 props 점검
// Map of component key -> entire JSON documentation object
export const ComponentDocsMap: Record<string, Record<string, unknown>> = {
    avatar: avatarData,
    badge: badgeData,
    box: boxData,
    breadcrumb: breadcrumbData,
    button: buttonData,
    card: cardData,
    callout: calloutData,
    collapsible: collapsibleData,
    field: fieldData,
    flex: flexData,
    grid: gridData,
    'h-stack': hStackData,
    'v-stack': vStackData,
    checkbox: checkboxData,
    'icon-button': iconButtonData,
    menu: menuData,
    'multi-select': multiSelectData,
    'navigation-menu': navigationMenuData,
    popover: popoverData,
    text: textData,
    'text-input': textInputData,
    dialog: dialogData,
    switch: switchData,
    table: tableData,
    tabs: tabsData,
    radio: radioData,
    'radio-card': radioCardData,
    'radio-group': radioGroupData,
    select: selectData,
    sheet: sheetData,
    tooltip: tooltipData,
    'input-group': inputGroupData,
    textarea: textareaData,
    paginationData,
};
