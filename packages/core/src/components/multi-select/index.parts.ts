export {
    MultiSelectRoot as Root,
    MultiSelectTrigger as Trigger,
    MultiSelectPopup as Popup,
    MultiSelectGroup as Group,
    MultiSelectGroupLabel as GroupLabel,
    MultiSelectItem as Item,
    MultiSelectSeparator as Separator,

    // Primitives
    MultiSelectValuePrimitive as ValuePrimitive,
    MultiSelectTriggerPrimitive as TriggerPrimitive,
    MultiSelectTriggerIconPrimitive as TriggerIconPrimitive,
    MultiSelectPopupPrimitive as PopupPrimitive,
    MultiSelectPortalPrimitive as PortalPrimitive,
    MultiSelectPositionerPrimitive as PositionerPrimitive,
    MultiSelectItemPrimitive as ItemPrimitive,
    MultiSelectItemIndicatorPrimitive as ItemIndicatorPrimitive,

    /**
     * @deprecated The `MultiSelect.PlaceholderPrimitive` component is deprecated and will be removed in a future release. Please use the `placeholder` prop on `MultiSelect.Root` instead and `data-placeholder` attribute for styling.
     */
    MultiSelectPlaceholderPrimitive as PlaceholderPrimitive,
} from './multi-select';
