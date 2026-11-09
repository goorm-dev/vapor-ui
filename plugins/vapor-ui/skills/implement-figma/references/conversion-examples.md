# Figma Conversion Examples

## Example 1: Design System Component Conversion

**User**: "Convert this Figma design: https://www.figma.com/design/ABC123/...?node-id=1-234"

**Action**:

1. Extract file_key=ABC123, node_id=1-234
2. Call Figma MCP `get_design_context`
3. Analyze response:
    - Root: Frame with `layoutMode: VERTICAL`, `itemSpacing: 16`
    - Child 1: `💙Field` with Label "Email"
    - Child 2: `💙Field` with Label "Password"
    - Child 3: `💙Button` with `ColorPalette: primary`

**Result**:

```tsx
<VStack $css={{ gap: '$200' }}>
    <Field.Root>
        <Field.Label>Email</Field.Label>
        <TextInput />
    </Field.Root>
    <Field.Root>
        <Field.Label>Password</Field.Label>
        <TextInput type="password" />
    </Field.Root>
    <Button colorPalette="primary">Submit</Button>
</VStack>
```

---

## Example 2: Custom Layout Conversion

**User**: "Implement this card layout from Figma"

**Figma node** (no 💙 prefix):

```json
{
    "name": "Card Container",
    "layoutMode": "HORIZONTAL",
    "itemSpacing": 16,
    "paddingTop": 24,
    "paddingBottom": 24,
    "paddingLeft": 16,
    "paddingRight": 16
}
```

**Result**:

```tsx
<HStack $css={{ gap: '$200', paddingY: '$300', paddingX: '$200' }}>{/* children */}</HStack>
```

---

## Example 3: Complex Layout with Mixed Components

**Figma structure**:

```
Frame (VERTICAL, itemSpacing: 24)
├── 💙Card
│   ├── Header: "User Profile"
│   ├── Body
│   │   ├── 💙Avatar (Size: lg)
│   │   └── Frame (VERTICAL, itemSpacing: 8)
│   │       ├── TEXT: "John Doe"
│   │       └── TEXT: "john@example.com"
│   └── Footer
│       └── 💙Button (ColorPalette: primary, Variant: outline)
```

**Result**:

```tsx
<VStack $css={{ gap: '$300' }}>
    <Card.Root>
        <Card.Header>User Profile</Card.Header>
        <Card.Body>
            <HStack $css={{ gap: '$200', alignItems: 'center' }}>
                <Avatar.Root size="lg">
                    <Avatar.ImagePrimitive src="/avatar.jpg" />
                    <Avatar.FallbackPrimitive>JD</Avatar.FallbackPrimitive>
                </Avatar.Root>
                <VStack $css={{ gap: '$100' }}>
                    <Text $css={{ fontWeight: 'bold' }}>John Doe</Text>
                    <Text $css={{ color: 'hint-100' }}>john@example.com</Text>
                </VStack>
            </HStack>
        </Card.Body>
        <Card.Footer>
            <Button colorPalette="primary" variant="outline">
                Edit Profile
            </Button>
        </Card.Footer>
    </Card.Root>
</VStack>
```

---

## Example 4: Form Layout Conversion

**Figma structure**:

```
Frame (VERTICAL, itemSpacing: 16, padding: 24)
├── 💙Field
│   ├── Label: "Email"
│   └── 💙Text Input
├── 💙Field
│   ├── Label: "Password"
│   └── 💙Text Input
├── 💙Checkbox
│   └── Label: "Remember me"
└── 💙Button (ColorPalette: primary, full width)
```

**Result**:

```tsx
<VStack $css={{ gap: '$200', padding: '$300' }}>
    <Field.Root>
        <Field.Label>Email</Field.Label>
        <TextInput type="email" />
    </Field.Root>
    <Field.Root>
        <Field.Label>Password</Field.Label>
        <TextInput type="password" />
    </Field.Root>
    <Checkbox.Root>
        <Checkbox.Control />
        <Checkbox.Label>Remember me</Checkbox.Label>
    </Checkbox.Root>
    <Button colorPalette="primary" $css={{ width: '100%' }}>
        Sign In
    </Button>
</VStack>
```
