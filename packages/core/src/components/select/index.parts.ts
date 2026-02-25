export {
    SelectRoot as Root,
    SelectTrigger as Trigger,
    SelectPopup as Popup,
    SelectItem as Item,
    SelectGroup as Group,
    SelectGroupLabel as GroupLabel,
    SelectSeparator as Separator,

    // primitives
    SelectValuePrimitive as ValuePrimitive,
    SelectTriggerPrimitive as TriggerPrimitive,
    SelectTriggerIconPrimitive as TriggerIconPrimitive,
    SelectPortalPrimitive as PortalPrimitive,
    SelectPositionerPrimitive as PositionerPrimitive,
    SelectPopupPrimitive as PopupPrimitive,
    SelectItemPrimitive as ItemPrimitive,
    SelectItemIndicatorPrimitive as ItemIndicatorPrimitive,

    /**
     * @deprecated The `Select.PlaceholderPrimitive` component is deprecated and will be removed in a future release. Please use the `placeholder` prop on `Select.Root` instead and `data-placeholder` attribute for styling.
     */
    SelectPlaceholderPrimitive as PlaceholderPrimitive,
} from './select';
