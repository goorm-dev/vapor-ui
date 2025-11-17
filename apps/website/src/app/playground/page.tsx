'use client';

import {
    Avatar,
    Badge,
    Button,
    Card,
    Checkbox,
    Dialog,
    IconButton,
    Switch,
    Text,
    TextInput,
} from '@vapor-ui/core';
import { HeartIcon, OpenInNewOutlineIcon } from '@vapor-ui/icons';
import Link from 'next/link';

import { getCartesianProduct } from '../../utils/array';
import RenderingTemplate from './_components/rendering-template';

const AVATAR_PROPS = {
    src: 'https://statics.goorm.io/gds/docs/images/vapor-log.svg',
    alt: 'vapor-ui',
};

const SIZES = ['sm', 'md', 'lg', 'xl'] as const;
const COLORS = ['primary', 'secondary', 'danger', 'success', 'warning', 'contrast'] as const;
const BADGE_COLORS = ['primary', 'hint', 'danger', 'success', 'warning', 'contrast'] as const;
const AVATAR_SHAPES = ['circle', 'square'] as const;
const BADGE_SHAPES = ['square', 'pill'] as const;
const BUTTON_VARIANTS = ['solid', 'outline'] as const;
const TEXT_HEADINGS = [
    'heading1',
    'heading2',
    'heading3',
    'heading4',
    'heading5',
    'heading6',
] as const;
const TEXT_BODIES = ['body1', 'body2', 'body3', 'body4'] as const;
const TEXT_SUBTITLES = ['subtitle1', 'subtitle2'] as const;

const renderAvatars = () => {
    const combinations = getCartesianProduct(AVATAR_SHAPES, SIZES);

    return combinations.map(([shape, size]) => (
        <Avatar.Root key={`${shape}-${size}`} shape={shape} size={size} {...AVATAR_PROPS} />
    ));
};

const renderBadges = () => {
    const badgeSizes = SIZES.slice(0, 3) as Array<'sm' | 'md' | 'lg'>;
    const combinations = getCartesianProduct(BADGE_SHAPES, badgeSizes, BADGE_COLORS);

    return combinations.map(([shape, size, color]) => (
        <Badge key={`${shape}-${size}-${color}`} shape={shape} size={size} colorPalette={color}>
            Badge
        </Badge>
    ));
};

const renderButtons = () => {
    const combinations = getCartesianProduct(BUTTON_VARIANTS, SIZES, COLORS);

    return combinations.map(([variant, size, color]) => (
        <Button
            key={`${variant}-${size}-${color}`}
            variant={variant === 'solid' ? undefined : variant}
            size={size}
            colorPalette={color}
        >
            Button
        </Button>
    ));
};

const renderIconButtons = () => {
    const combinations = getCartesianProduct(BUTTON_VARIANTS, SIZES, COLORS);

    return combinations.map(([variant, size, color]) => (
        <IconButton
            key={`${variant}-${size}-${color}`}
            aria-label="icon-button"
            variant={variant === 'solid' ? undefined : variant}
            size={size}
            colorPalette={color}
        >
            <HeartIcon />
        </IconButton>
    ));
};

const renderSwitches = () => {
    const switchStates = [
        { defaultChecked: false, disabled: false },
        { defaultChecked: true, disabled: false },
        { defaultChecked: false, disabled: true },
    ];
    const switchSizes = SIZES.slice(0, 3) as Array<'sm' | 'md' | 'lg'>;
    const combinations = getCartesianProduct(switchSizes, switchStates);

    return combinations.map(([size, state], index) => (
        <label key={`${size}-${index}`}>
            <Switch.Root
                size={size}
                defaultChecked={state.defaultChecked}
                disabled={state.disabled}
            />
            <Text typography="body2">Airplane mode</Text>
        </label>
    ));
};

const renderTextInputs = () => {
    const inputVariants = ['default', 'disabled', 'invalid', 'readOnly'] as const;
    const combinations = getCartesianProduct(SIZES, inputVariants);

    return combinations.map(([size, variant]) => (
        <label key={`${size}-${variant}`} className="flex flex-col gap-v-100">
            "{variant}" Input
            <TextInput
                size={size}
                disabled={variant === 'disabled'}
                invalid={variant === 'invalid'}
                readOnly={variant === 'readOnly'}
                placeholder={`${size} ${variant}`}
            />
        </label>
    ));
};

const renderTextElements = (typographies: readonly string[], title: string) => (
    <RenderingTemplate>
        <RenderingTemplate.Title title={title} />
        <RenderingTemplate.Component rows={typographies.length} gap="0.5rem">
            {typographies.map((typography) => (
                <Text
                    key={typography}
                    typography={
                        typography as
                            | 'heading1'
                            | 'heading2'
                            | 'heading3'
                            | 'heading4'
                            | 'heading5'
                            | 'heading6'
                            | 'body1'
                            | 'body2'
                            | 'body3'
                            | 'body4'
                            | 'subtitle1'
                            | 'subtitle2'
                    }
                >
                    {typography}
                </Text>
            ))}
        </RenderingTemplate.Component>
    </RenderingTemplate>
);

const Page = () => {
    return (
        <div className="px-8 py-16 min-h-screen bg-[var(--vapor-color-background-canvas)]">
            <div className="w-max flex flex-col gap-12 [&>header]:flex [&>header]:flex-col [&>header]:gap-4 [&>section]:flex [&>section]:flex-col [&>section]:gap-[var(--vapor-size-space-800)]">
                <header>
                    <Text typography="heading1">Theme Playground</Text>
                    <Link href="/docs/getting-started/theming">
                        <Button variant="outline" colorPalette="secondary">
                            <OpenInNewOutlineIcon />
                            Theme Provider Usage 보러가기
                        </Button>
                    </Link>
                </header>
                <section>
                    <RenderingTemplate>
                        <RenderingTemplate.Title title="Button" />
                        <RenderingTemplate.Component cols={6} rows={8} gap="1.5rem">
                            {renderButtons()}
                        </RenderingTemplate.Component>
                    </RenderingTemplate>

                    <RenderingTemplate>
                        <RenderingTemplate.Title title="IconButton" />
                        <RenderingTemplate.Component cols={6} rows={8} gap="1.5rem">
                            {renderIconButtons()}
                        </RenderingTemplate.Component>
                    </RenderingTemplate>

                    <RenderingTemplate>
                        <RenderingTemplate.Title title="Switch" />
                        <RenderingTemplate.Component cols={3} rows={3} gap="1.5rem">
                            {renderSwitches()}
                        </RenderingTemplate.Component>
                    </RenderingTemplate>

                    <RenderingTemplate>
                        <RenderingTemplate.Title title="Checkbox" />
                        <RenderingTemplate.Component rows={2} gap="1rem">
                            <Text render={<label />} typography="body2">
                                <Checkbox.Root defaultChecked />
                                Checkbox
                            </Text>

                            <Text render={<label />} typography="body2">
                                <Checkbox.Root id="checkbox-lg" defaultChecked size="lg" />
                                Checkbox
                            </Text>
                        </RenderingTemplate.Component>
                    </RenderingTemplate>

                    <RenderingTemplate>
                        <RenderingTemplate.Title title="TextInput" />
                        <RenderingTemplate.Component cols={4} rows={4} gap="1.5rem">
                            {renderTextInputs()}
                        </RenderingTemplate.Component>
                    </RenderingTemplate>

                    <RenderingTemplate>
                        <RenderingTemplate.Title title="Avatar" />
                        <RenderingTemplate.Component cols={4} rows={2} gap="1.5rem">
                            {renderAvatars()}
                        </RenderingTemplate.Component>
                    </RenderingTemplate>

                    <RenderingTemplate>
                        <RenderingTemplate.Title title="Badge" />
                        <RenderingTemplate.Component cols={6} rows={6} gap="1.5rem">
                            {renderBadges()}
                        </RenderingTemplate.Component>
                    </RenderingTemplate>

                    <RenderingTemplate>
                        <RenderingTemplate.Title title="Card" />
                        <RenderingTemplate.Component>
                            <Card.Root style={{ maxWidth: '400px' }}>
                                <Card.Header>Card Header</Card.Header>
                                <Card.Body>Card Body</Card.Body>
                                <Card.Footer>Card Footer</Card.Footer>
                            </Card.Root>
                        </RenderingTemplate.Component>
                    </RenderingTemplate>

                    <RenderingTemplate>
                        <RenderingTemplate.Title title="Dialog" />
                        <RenderingTemplate.Component>
                            <Dialog.Root>
                                <Dialog.Trigger render={<Button>트리거</Button>} />

                                <Dialog.Popup>
                                    <Dialog.Header>Header</Dialog.Header>
                                    <Dialog.Body>Body</Dialog.Body>
                                    <Dialog.Footer>Footer</Dialog.Footer>
                                </Dialog.Popup>
                            </Dialog.Root>
                        </RenderingTemplate.Component>
                    </RenderingTemplate>

                    {renderTextElements(TEXT_HEADINGS, 'Text - heading')}

                    {renderTextElements(TEXT_BODIES, 'Text - body')}

                    {renderTextElements(TEXT_SUBTITLES, 'Text - subtitle')}
                </section>
            </div>
        </div>
    );
};

export default Page;
