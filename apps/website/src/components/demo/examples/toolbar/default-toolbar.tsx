import { type ComponentType, cloneElement, useState } from 'react';

import { Card, Select, Toggle, ToggleGroup, Toolbar, Tooltip } from '@vapor-ui/core';
import {
    AlignCenterOutlineIcon,
    AlignLeftOutlineIcon,
    AlignRightOutlineIcon,
    BoldOutlineIcon,
    ItalicIcon,
    StrikeOutlineIcon,
    UnderlineOutlineIcon,
} from '@vapor-ui/icons';

export default function DefaultToolbar() {
    const [fontFamily, setFontFamily] = useState('');
    const [fontSize, setFontSize] = useState<number>();

    const handleValueChange = (value: string) => {
        const parsedValue = value ? parseInt(value, 10) : 0;

        if (isNaN(parsedValue)) return;

        setFontSize(parsedValue);
    };

    return (
        <Card.Root>
            <Card.Header>
                <Toolbar.Root>
                    <Toolbar.Input
                        placeholder="font size(px)"
                        value={fontSize}
                        onValueChange={handleValueChange}
                    />
                    <AlignSelect
                        trigger={Toolbar.Button}
                        items={selectItems}
                        value={fontFamily}
                        onValueChange={setFontFamily}
                        placeholder="select font"
                    />

                    <Toolbar.Separator />

                    <TooltipButton description="Bold">
                        <Toolbar.Button render={<Toggle />}>
                            <BoldOutlineIcon />
                        </Toolbar.Button>
                    </TooltipButton>
                    <TooltipButton description="Italic">
                        <Toolbar.Button render={<Toggle />}>
                            <ItalicIcon />
                        </Toolbar.Button>
                    </TooltipButton>
                    <TooltipButton description="Strike Through">
                        <Toolbar.Button render={<Toggle />}>
                            <StrikeOutlineIcon />
                        </Toolbar.Button>
                    </TooltipButton>
                    <TooltipButton description="Underline">
                        <Toolbar.Button render={<Toggle />}>
                            <UnderlineOutlineIcon />
                        </Toolbar.Button>
                    </TooltipButton>

                    <Toolbar.Separator />

                    <Toolbar.Group render={<ToggleGroup />}>
                        <TooltipButton description="Align Left">
                            <Toolbar.Button render={<Toggle variant="accent" />}>
                                <AlignLeftOutlineIcon />
                            </Toolbar.Button>
                        </TooltipButton>
                        <TooltipButton description="Align Center">
                            <Toolbar.Button render={<Toggle variant="accent" />}>
                                <AlignCenterOutlineIcon />
                            </Toolbar.Button>
                        </TooltipButton>
                        <TooltipButton description="Align Right">
                            <Toolbar.Button render={<Toggle variant="accent" />}>
                                <AlignRightOutlineIcon />
                            </Toolbar.Button>
                        </TooltipButton>
                    </Toolbar.Group>

                    <Toolbar.Separator />

                    <Toolbar.Group>
                        <Toolbar.Button>Button 1</Toolbar.Button>
                        <Toolbar.Button>Button 2</Toolbar.Button>
                        <Toolbar.Button>Button 3</Toolbar.Button>
                    </Toolbar.Group>
                </Toolbar.Root>
            </Card.Header>

            <Card.Body>
                <p style={{ fontFamily, fontSize: `${fontSize}px` }}>
                    Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed non risus.
                    Suspendisse lectus tortor, dignissim sit amet, adipiscing nec, ultricies sed,
                    dolor. Cras elementum ultrices diam. Maecenas ligula massa, varius a, semper
                    congue, euismod non, mi.
                </p>

                <p></p>
            </Card.Body>
        </Card.Root>
    );
}

/* -----------------------------------------------------------------------------------------------*/

type SelectItem = {
    value: string;
    label: string;
};

const selectItems: SelectItem[] = [
    { value: 'helvetica', label: 'Helvetica' },
    { value: 'Roboto', label: 'Roboto' },
    { value: 'Arial', label: 'Arial' },
    { value: 'Monospace', label: 'Monospace' },
    { value: 'Monserrat', label: 'Monserrat' },
];

interface TooltipButtonProps {
    description: React.ReactNode;
    children: React.ReactElement;
}

const TooltipButton = ({ description, children, ...props }: TooltipButtonProps) => {
    return (
        <Tooltip.Root {...props}>
            <Tooltip.Trigger render={children} delay={150} />
            <Tooltip.Popup>{description}</Tooltip.Popup>
        </Tooltip.Root>
    );
};

/* -----------------------------------------------------------------------------------------------*/

interface AlignSelectProps {
    trigger: ComponentType<Toolbar.Button.Props>;
    items: SelectItem[];
    value: string;
    onValueChange: (value: string) => void;
    placeholder?: string;
}

const AlignSelect = ({
    trigger: Trigger,
    items,
    value,
    onValueChange,
    placeholder,
}: AlignSelectProps) => {
    const [font, setFont] = useState(value);
    const handleFontChange = (value: string | null) => {
        setFont((prev) => value ?? prev);
        onValueChange(value ?? '');
    };

    const trigger = cloneElement(<Trigger render={<Select.TriggerPrimitive />} />, {
        children: (
            <>
                <Select.ValuePrimitive style={{ fontFamily: font }} />
                <Select.TriggerIconPrimitive />
            </>
        ),
    });

    return (
        <Select.Root
            items={items}
            value={font}
            onValueChange={handleFontChange}
            placeholder={placeholder}
        >
            {trigger}

            <Select.Popup $css={{ minWidth: 'auto' }}>
                {items.map((item) => (
                    <Select.Item key={item.value} value={item.value}>
                        {item.label}
                    </Select.Item>
                ))}
            </Select.Popup>
        </Select.Root>
    );
};
