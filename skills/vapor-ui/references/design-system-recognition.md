# Design System Component Recognition

## 💙 Prefix Pattern

Nodes with **💙** prefix are vapor-ui design system components.

### Recognition Rules

1. **Check node name**: Starts with "💙" → Design system component
2. **Extract component name**: Remove "💙 " prefix
3. **Extract variants**: From `componentProperties` object

## Component Name Extraction

| Figma Node Name        | Vapor-UI Component |
|------------------------|---------------------|
| 💙Button               | Button              |
| 💙Avatar               | Avatar.Root         |
| 💙Card                 | Card.Root           |
| 💙Text Input           | TextInput           |
| 💙Checkbox             | Checkbox.Root       |
| 💙Dialog               | Dialog.Root         |
| 💙Badge                | Badge               |
| 💙Callout              | Callout.Root        |
| 💙Icon Button          | IconButton          |
| 💙Field                | Field.Root          |
| 💙Select               | Select.Root         |
| 💙Switch               | Switch.Root         |
| 💙Tabs                 | Tabs.Root           |
| 💙Table                | Table.Root          |
| 💙Tooltip              | Tooltip.Root        |
| 💙Toast                | Toast.Root          |
| 💙Menu                 | Menu.Root           |
| 💙Popover              | Popover.Root        |
| 💙Sheet                | Sheet.Root          |
| 💙Radio                | Radio.Root          |
| 💙Radio Group          | RadioGroup.Root     |
| 💙Radio Card           | RadioCard.Root      |
| 💙Pagination           | Pagination.Root     |
| 💙Breadcrumb           | Breadcrumb.Root     |
| 💙Navigation Menu      | NavigationMenu.Root |

## Variant Extraction

Component instances have variant properties in `componentProperties`:

```json
{
  "componentProperties": {
    "Size": { "value": "md" },
    "ColorPalette": { "value": "primary" },
    "Variant": { "value": "fill" }
  }
}
```

### Variant to Props Mapping

| Figma Variant   | Prop Name     | Values                                    |
|-----------------|---------------|-------------------------------------------|
| Size            | size          | sm, md, lg, xl                            |
| ColorPalette    | colorPalette  | primary, secondary, success, warning, danger, contrast |
| Variant         | variant       | fill, outline, ghost                      |
| Shape           | shape         | square, circle                            |
| Disabled        | disabled      | true, false                               |
| State           | (skip)        | Visual states - ignore in code            |

### Output Example:
```tsx
<Button size="md" colorPalette="primary" variant="fill">
  Button Text
</Button>
```

## Compound Component Children

For compound components, detect sub-components by child node names:

### Card
| Child Pattern | Vapor-UI Sub-component |
|---------------|------------------------|
| Header        | Card.Header            |
| Body          | Card.Body              |
| Footer        | Card.Footer            |

### Dialog
| Child Pattern | Vapor-UI Sub-component |
|---------------|------------------------|
| Header        | Dialog.Header          |
| Body          | Dialog.Body            |
| Footer        | Dialog.Footer          |
| Close         | Dialog.Close           |

### Avatar
| Child Pattern | Vapor-UI Sub-component      |
|---------------|-----------------------------|
| Image         | Avatar.ImagePrimitive       |
| Fallback      | Avatar.FallbackPrimitive    |

### Tabs
| Child Pattern | Vapor-UI Sub-component |
|---------------|------------------------|
| List          | Tabs.List              |
| Tab           | Tabs.Tab               |
| Panel         | Tabs.Panel             |

### Field
| Child Pattern | Vapor-UI Sub-component |
|---------------|------------------------|
| Label         | Field.Label            |
| Input         | (use TextInput/Select) |
| Description   | Field.Description      |
| Error         | Field.Error            |

## Non-Design-System Nodes

Nodes **without** 💙 prefix are custom layouts:
- Convert based on auto-layout properties
- Use Box, Flex, VStack, HStack, or Grid
- Apply style props from node properties

## Text Node Handling

TEXT nodes inside design system components:
- Extract `characters` property for text content
- Apply to component children or specific props

```tsx
// Figma: 💙Button with TEXT child "Submit"
<Button>Submit</Button>

// Figma: 💙Field with Label TEXT "Email"
<Field.Root>
  <Field.Label>Email</Field.Label>
  <TextInput />
</Field.Root>
```
