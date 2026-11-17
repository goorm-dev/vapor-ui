---
'@vapor-ui/core': patch
---

figma-blueprint now grades Menu, NavigationMenu, Textarea, Toast and Toolbar instances in Figma designs instead of reporting them as unscorable. Three parts are not graded correctly yet: Menu.SubTriggerItem and Toast.Close, whose Figma and code names differ (code `Menu.SubmenuTriggerItem` and `Toast.ClosePrimitive`), and Menu.Root, whose answer sheet counts Menu.Popup twice. Field stays unscorable while its nested Field.Label is unpublished in Figma.
