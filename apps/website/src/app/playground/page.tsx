'use client';

import {
    AvatarSimple,
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

import PageWrapper from './_components/page-wrapper';
import RenderingTemplate from './_components/rendering-template';

const Page = () => {
    return (
        <PageWrapper>
            <header>
                <Text typography="heading1">Theme Playground</Text>
                <Link href="/docs/getting-started/theming">
                    <Button variant="outline" color="secondary">
                        <OpenInNewOutlineIcon />
                        Theme Provider Usage 보러가기
                    </Button>
                </Link>
            </header>
            <section>
                <RenderingTemplate>
                    <RenderingTemplate.Title title="Avatar" />
                    <RenderingTemplate.Component cols={4} rows={2} gap="1.5rem">
                        <AvatarSimple
                            shape="circle"
                            size="sm"
                            src="https://statics.goorm.io/gds/resources/brand-images/light/favi_goorm.svg"
                            alt="vapor-ui"
                        />
                        <AvatarSimple
                            shape="circle"
                            size="md"
                            src="https://statics.goorm.io/gds/resources/brand-images/light/favi_goorm.svg"
                            alt="vapor-ui"
                        />
                        <AvatarSimple
                            shape="circle"
                            size="lg"
                            src="https://statics.goorm.io/gds/resources/brand-images/light/favi_goorm.svg"
                            alt="vapor-ui"
                        />
                        <AvatarSimple
                            shape="circle"
                            size="xl"
                            src="https://statics.goorm.io/gds/resources/brand-images/light/favi_goorm.svg"
                            alt="vapor-ui"
                        />
                        <AvatarSimple
                            shape="square"
                            size="sm"
                            src="https://statics.goorm.io/gds/resources/brand-images/light/favi_goorm.svg"
                            alt="vapor-ui"
                        />
                        <AvatarSimple
                            shape="square"
                            size="md"
                            src="https://statics.goorm.io/gds/resources/brand-images/light/favi_goorm.svg"
                            alt="vapor-ui"
                        />
                        <AvatarSimple
                            shape="square"
                            size="lg"
                            src="https://statics.goorm.io/gds/resources/brand-images/light/favi_goorm.svg"
                            alt="vapor-ui"
                        />
                        <AvatarSimple
                            shape="square"
                            size="xl"
                            src="https://statics.goorm.io/gds/resources/brand-images/light/favi_goorm.svg"
                            alt="vapor-ui"
                        />
                    </RenderingTemplate.Component>
                </RenderingTemplate>

                <RenderingTemplate>
                    <RenderingTemplate.Title title="Badge" />
                    <RenderingTemplate.Component cols={6} rows={3} gap="1.5rem">
                        <Badge shape="square" size="sm" color="primary">
                            Badge
                        </Badge>

                        <Badge shape="square" size="sm" color="hint">
                            Badge
                        </Badge>

                        <Badge shape="square" size="sm" color="danger">
                            Badge
                        </Badge>

                        <Badge shape="square" size="sm" color="success">
                            Badge
                        </Badge>

                        <Badge shape="square" size="sm" color="warning">
                            Badge
                        </Badge>

                        <Badge shape="square" size="sm" color="contrast">
                            Badge
                        </Badge>
                        <Badge shape="pill" size="sm" color="primary">
                            Badge
                        </Badge>
                        <Badge shape="pill" size="sm" color="hint">
                            Badge
                        </Badge>
                        <Badge shape="pill" size="sm" color="danger">
                            Badge
                        </Badge>
                        <Badge shape="pill" size="sm" color="success">
                            Badge
                        </Badge>
                        <Badge shape="pill" size="sm" color="warning">
                            Badge
                        </Badge>
                        <Badge shape="pill" size="sm" color="contrast">
                            Badge
                        </Badge>

                        <Badge shape="square" size="md" color="primary">
                            Badge
                        </Badge>
                        <Badge shape="square" size="md" color="hint">
                            Badge
                        </Badge>
                        <Badge shape="square" size="md" color="danger">
                            Badge
                        </Badge>
                        <Badge shape="square" size="md" color="success">
                            Badge
                        </Badge>
                        <Badge shape="square" size="md" color="warning">
                            Badge
                        </Badge>
                        <Badge shape="square" size="md" color="contrast">
                            Badge
                        </Badge>

                        <Badge shape="pill" size="md" color="primary">
                            Badge
                        </Badge>
                        <Badge shape="pill" size="md" color="hint">
                            Badge
                        </Badge>
                        <Badge shape="pill" size="md" color="danger">
                            Badge
                        </Badge>
                        <Badge shape="pill" size="md" color="success">
                            Badge
                        </Badge>
                        <Badge shape="pill" size="md" color="warning">
                            Badge
                        </Badge>
                        <Badge shape="pill" size="md" color="contrast">
                            Badge
                        </Badge>

                        <Badge shape="square" size="lg" color="primary">
                            Badge
                        </Badge>
                        <Badge shape="square" size="lg" color="hint">
                            Badge
                        </Badge>
                        <Badge shape="square" size="lg" color="danger">
                            Badge
                        </Badge>
                        <Badge shape="square" size="lg" color="success">
                            Badge
                        </Badge>
                        <Badge shape="square" size="lg" color="warning">
                            Badge
                        </Badge>
                        <Badge shape="square" size="lg" color="contrast">
                            Badge
                        </Badge>

                        <Badge shape="pill" size="lg" color="primary">
                            Badge
                        </Badge>
                        <Badge shape="pill" size="lg" color="hint">
                            Badge
                        </Badge>
                        <Badge shape="pill" size="lg" color="danger">
                            Badge
                        </Badge>
                        <Badge shape="pill" size="lg" color="success">
                            Badge
                        </Badge>
                        <Badge shape="pill" size="lg" color="warning">
                            Badge
                        </Badge>
                        <Badge shape="pill" size="lg" color="contrast">
                            Badge
                        </Badge>
                    </RenderingTemplate.Component>
                </RenderingTemplate>

                <RenderingTemplate>
                    <RenderingTemplate.Title title="Button" />
                    <RenderingTemplate.Component cols={6} rows={4} gap="1.5rem">
                        <Button size="sm" color="primary">
                            Button
                        </Button>
                        <Button size="sm" color="secondary">
                            Button
                        </Button>
                        <Button size="sm" color="danger">
                            Button
                        </Button>
                        <Button size="sm" color="success">
                            Button
                        </Button>
                        <Button size="sm" color="warning">
                            Button
                        </Button>
                        <Button size="sm" color="contrast">
                            Button
                        </Button>

                        <Button variant="outline" size="sm" color="primary">
                            Button
                        </Button>
                        <Button variant="outline" size="sm" color="secondary">
                            Button
                        </Button>
                        <Button variant="outline" size="sm" color="danger">
                            Button
                        </Button>
                        <Button variant="outline" size="sm" color="success">
                            Button
                        </Button>
                        <Button variant="outline" size="sm" color="warning">
                            Button
                        </Button>
                        <Button variant="outline" size="sm" color="contrast">
                            Button
                        </Button>

                        <Button size="md" color="primary">
                            Button
                        </Button>
                        <Button size="md" color="secondary">
                            Button
                        </Button>
                        <Button size="md" color="danger">
                            Button
                        </Button>
                        <Button size="md" color="success">
                            Button
                        </Button>
                        <Button size="md" color="warning">
                            Button
                        </Button>
                        <Button size="md" color="contrast">
                            Button
                        </Button>

                        <Button variant="outline" size="md" color="primary">
                            Button
                        </Button>
                        <Button variant="outline" size="md" color="secondary">
                            Button
                        </Button>
                        <Button variant="outline" size="md" color="danger">
                            Button
                        </Button>
                        <Button variant="outline" size="md" color="success">
                            Button
                        </Button>
                        <Button variant="outline" size="md" color="warning">
                            Button
                        </Button>
                        <Button variant="outline" size="md" color="contrast">
                            Button
                        </Button>

                        <Button size="lg" color="primary">
                            Button
                        </Button>
                        <Button size="lg" color="secondary">
                            Button
                        </Button>
                        <Button size="lg" color="danger">
                            Button
                        </Button>
                        <Button size="lg" color="success">
                            Button
                        </Button>
                        <Button size="lg" color="warning">
                            Button
                        </Button>
                        <Button size="lg" color="contrast">
                            Button
                        </Button>

                        <Button variant="outline" size="lg" color="primary">
                            Button
                        </Button>
                        <Button variant="outline" size="lg" color="secondary">
                            Button
                        </Button>
                        <Button variant="outline" size="lg" color="danger">
                            Button
                        </Button>
                        <Button variant="outline" size="lg" color="success">
                            Button
                        </Button>
                        <Button variant="outline" size="lg" color="warning">
                            Button
                        </Button>
                        <Button variant="outline" size="lg" color="contrast">
                            Button
                        </Button>

                        <Button size="xl" color="primary">
                            Button
                        </Button>
                        <Button size="xl" color="secondary">
                            Button
                        </Button>
                        <Button size="xl" color="danger">
                            Button
                        </Button>
                        <Button size="xl" color="success">
                            Button
                        </Button>
                        <Button size="xl" color="warning">
                            Button
                        </Button>
                        <Button size="xl" color="contrast">
                            Button
                        </Button>

                        <Button variant="outline" size="xl" color="primary">
                            Button
                        </Button>
                        <Button variant="outline" size="xl" color="secondary">
                            Button
                        </Button>
                        <Button variant="outline" size="xl" color="danger">
                            Button
                        </Button>
                        <Button variant="outline" size="xl" color="success">
                            Button
                        </Button>
                        <Button variant="outline" size="xl" color="warning">
                            Button
                        </Button>
                        <Button variant="outline" size="xl" color="contrast">
                            Button
                        </Button>
                    </RenderingTemplate.Component>
                </RenderingTemplate>

                <RenderingTemplate>
                    <RenderingTemplate.Title title="Card" />
                    <RenderingTemplate.Component>
                        <Card.Root>
                            <Card.Header>Card Header</Card.Header>
                            <Card.Body>Card Body</Card.Body>
                            <Card.Footer>Card Footer</Card.Footer>
                        </Card.Root>
                    </RenderingTemplate.Component>
                </RenderingTemplate>

                <RenderingTemplate>
                    <RenderingTemplate.Title title="Checkbox" />
                    <RenderingTemplate.Component rows={2} gap="1rem">
                        <Checkbox.Root id="checkbox" defaultChecked>
                            <Checkbox.Control />
                            <Checkbox.Label htmlFor="checkbox">Checkbox</Checkbox.Label>
                        </Checkbox.Root>

                        <Checkbox.Root id="checkbox" defaultChecked size="lg">
                            <Checkbox.Control />
                            <Checkbox.Label htmlFor="checkbox">Checkbox</Checkbox.Label>
                        </Checkbox.Root>
                    </RenderingTemplate.Component>
                </RenderingTemplate>

                <RenderingTemplate>
                    <RenderingTemplate.Title title="Dialog" />
                    <RenderingTemplate.Component>
                        <Dialog.Root>
                            <Dialog.Trigger asChild>
                                <Button>트리거</Button>
                            </Dialog.Trigger>
                            <Dialog.Portal>
                                <Dialog.Overlay />
                                <Dialog.Content>
                                    <Dialog.Header>Header</Dialog.Header>
                                    <Dialog.Body>Body</Dialog.Body>
                                    <Dialog.Footer>Footer</Dialog.Footer>
                                </Dialog.Content>
                            </Dialog.Portal>
                        </Dialog.Root>
                    </RenderingTemplate.Component>
                </RenderingTemplate>

                <RenderingTemplate>
                    <RenderingTemplate.Title title="IconButton" />
                    <RenderingTemplate.Component cols={6} rows={4} gap="1.5rem">
                        <IconButton aria-label="icon-button" size="sm" color="primary">
                            <HeartIcon />
                        </IconButton>
                        <IconButton aria-label="icon-button" size="sm" color="secondary">
                            <HeartIcon />
                        </IconButton>
                        <IconButton aria-label="icon-button" size="sm" color="danger">
                            <HeartIcon />
                        </IconButton>
                        <IconButton aria-label="icon-button" size="sm" color="success">
                            <HeartIcon />
                        </IconButton>
                        <IconButton aria-label="icon-button" size="sm" color="warning">
                            <HeartIcon />
                        </IconButton>
                        <IconButton aria-label="icon-button" size="sm" color="contrast">
                            <HeartIcon />
                        </IconButton>

                        <IconButton
                            aria-label="icon-button"
                            variant="outline"
                            size="sm"
                            color="primary"
                        >
                            <HeartIcon />
                        </IconButton>
                        <IconButton
                            aria-label="icon-button"
                            variant="outline"
                            size="sm"
                            color="secondary"
                        >
                            <HeartIcon />
                        </IconButton>
                        <IconButton
                            aria-label="icon-button"
                            variant="outline"
                            size="sm"
                            color="danger"
                        >
                            <HeartIcon />
                        </IconButton>
                        <IconButton
                            aria-label="icon-button"
                            variant="outline"
                            size="sm"
                            color="success"
                        >
                            <HeartIcon />
                        </IconButton>
                        <IconButton
                            aria-label="icon-button"
                            variant="outline"
                            size="sm"
                            color="warning"
                        >
                            <HeartIcon />
                        </IconButton>
                        <IconButton
                            aria-label="icon-button"
                            variant="outline"
                            size="sm"
                            color="contrast"
                        >
                            <HeartIcon />
                        </IconButton>

                        <IconButton aria-label="icon-button" size="md" color="primary">
                            <HeartIcon />
                        </IconButton>
                        <IconButton aria-label="icon-button" size="md" color="secondary">
                            <HeartIcon />
                        </IconButton>
                        <IconButton aria-label="icon-button" size="md" color="danger">
                            <HeartIcon />
                        </IconButton>
                        <IconButton aria-label="icon-button" size="md" color="success">
                            <HeartIcon />
                        </IconButton>
                        <IconButton aria-label="icon-button" size="md" color="warning">
                            <HeartIcon />
                        </IconButton>
                        <IconButton aria-label="icon-button" size="md" color="contrast">
                            <HeartIcon />
                        </IconButton>

                        <IconButton
                            aria-label="icon-button"
                            variant="outline"
                            size="md"
                            color="primary"
                        >
                            <HeartIcon />
                        </IconButton>
                        <IconButton
                            aria-label="icon-button"
                            variant="outline"
                            size="md"
                            color="secondary"
                        >
                            <HeartIcon />
                        </IconButton>
                        <IconButton
                            aria-label="icon-button"
                            variant="outline"
                            size="md"
                            color="danger"
                        >
                            <HeartIcon />
                        </IconButton>
                        <IconButton
                            aria-label="icon-button"
                            variant="outline"
                            size="md"
                            color="success"
                        >
                            <HeartIcon />
                        </IconButton>
                        <IconButton
                            aria-label="icon-button"
                            variant="outline"
                            size="md"
                            color="warning"
                        >
                            <HeartIcon />
                        </IconButton>
                        <IconButton
                            aria-label="icon-button"
                            variant="outline"
                            size="md"
                            color="contrast"
                        >
                            <HeartIcon />
                        </IconButton>

                        <IconButton aria-label="icon-button" size="lg" color="primary">
                            <HeartIcon />
                        </IconButton>
                        <IconButton aria-label="icon-button" size="lg" color="secondary">
                            <HeartIcon />
                        </IconButton>
                        <IconButton aria-label="icon-button" size="lg" color="danger">
                            <HeartIcon />
                        </IconButton>
                        <IconButton aria-label="icon-button" size="lg" color="success">
                            <HeartIcon />
                        </IconButton>
                        <IconButton aria-label="icon-button" size="lg" color="warning">
                            <HeartIcon />
                        </IconButton>
                        <IconButton aria-label="icon-button" size="lg" color="contrast">
                            <HeartIcon />
                        </IconButton>

                        <IconButton
                            aria-label="icon-button"
                            variant="outline"
                            size="lg"
                            color="primary"
                        >
                            <HeartIcon />
                        </IconButton>
                        <IconButton
                            aria-label="icon-button"
                            variant="outline"
                            size="lg"
                            color="secondary"
                        >
                            <HeartIcon />
                        </IconButton>
                        <IconButton
                            aria-label="icon-button"
                            variant="outline"
                            size="lg"
                            color="danger"
                        >
                            <HeartIcon />
                        </IconButton>
                        <IconButton
                            aria-label="icon-button"
                            variant="outline"
                            size="lg"
                            color="success"
                        >
                            <HeartIcon />
                        </IconButton>
                        <IconButton
                            aria-label="icon-button"
                            variant="outline"
                            size="lg"
                            color="warning"
                        >
                            <HeartIcon />
                        </IconButton>
                        <IconButton
                            aria-label="icon-button"
                            variant="outline"
                            size="lg"
                            color="contrast"
                        >
                            <HeartIcon />
                        </IconButton>

                        <IconButton aria-label="icon-button" size="xl" color="primary">
                            <HeartIcon />
                        </IconButton>
                        <IconButton aria-label="icon-button" size="xl" color="secondary">
                            <HeartIcon />
                        </IconButton>
                        <IconButton aria-label="icon-button" size="xl" color="danger">
                            <HeartIcon />
                        </IconButton>
                        <IconButton aria-label="icon-button" size="xl" color="success">
                            <HeartIcon />
                        </IconButton>
                        <IconButton aria-label="icon-button" size="xl" color="warning">
                            <HeartIcon />
                        </IconButton>
                        <IconButton aria-label="icon-button" size="xl" color="contrast">
                            <HeartIcon />
                        </IconButton>

                        <IconButton
                            aria-label="icon-button"
                            variant="outline"
                            size="xl"
                            color="primary"
                        >
                            <HeartIcon />
                        </IconButton>
                        <IconButton
                            aria-label="icon-button"
                            variant="outline"
                            size="xl"
                            color="secondary"
                        >
                            <HeartIcon />
                        </IconButton>
                        <IconButton
                            aria-label="icon-button"
                            variant="outline"
                            size="xl"
                            color="danger"
                        >
                            <HeartIcon />
                        </IconButton>
                        <IconButton
                            aria-label="icon-button"
                            variant="outline"
                            size="xl"
                            color="success"
                        >
                            <HeartIcon />
                        </IconButton>
                        <IconButton
                            aria-label="icon-button"
                            variant="outline"
                            size="xl"
                            color="warning"
                        >
                            <HeartIcon />
                        </IconButton>
                        <IconButton
                            aria-label="icon-button"
                            variant="outline"
                            size="xl"
                            color="contrast"
                        >
                            <HeartIcon />
                        </IconButton>
                    </RenderingTemplate.Component>
                </RenderingTemplate>

                <RenderingTemplate>
                    <RenderingTemplate.Title title="Switch" />
                    <RenderingTemplate.Component cols={3} rows={6} gap="1.5rem">
                        <Switch.Root size="sm">
                            <Switch.Label>Airplane mode</Switch.Label>
                            <Switch.Control />
                        </Switch.Root>
                        <Switch.Root size="sm" defaultChecked>
                            <Switch.Label>Airplane mode</Switch.Label>
                            <Switch.Control />
                        </Switch.Root>
                        <Switch.Root size="sm" disabled>
                            <Switch.Label>Airplane mode</Switch.Label>
                            <Switch.Control />
                        </Switch.Root>

                        <Switch.Root size="md">
                            <Switch.Label>Airplane mode</Switch.Label>
                            <Switch.Control />
                        </Switch.Root>
                        <Switch.Root size="md" defaultChecked>
                            <Switch.Label>Airplane mode</Switch.Label>
                            <Switch.Control />
                        </Switch.Root>
                        <Switch.Root size="md" disabled>
                            <Switch.Label>Airplane mode</Switch.Label>
                            <Switch.Control />
                        </Switch.Root>

                        <Switch.Root size="lg">
                            <Switch.Label>Airplane mode</Switch.Label>
                            <Switch.Control />
                        </Switch.Root>
                        <Switch.Root size="lg" defaultChecked>
                            <Switch.Label>Airplane mode</Switch.Label>
                            <Switch.Control />
                        </Switch.Root>
                        <Switch.Root size="lg" disabled>
                            <Switch.Label>Airplane mode</Switch.Label>
                            <Switch.Control />
                        </Switch.Root>
                    </RenderingTemplate.Component>
                </RenderingTemplate>

                <RenderingTemplate>
                    <RenderingTemplate.Title title="TextInput" />
                    <RenderingTemplate.Component cols={2} gap="1.5rem">
                        <TextInput.Root size="sm" type="text">
                            <TextInput.Label>type text 입니다.</TextInput.Label>
                            <TextInput.Field />
                        </TextInput.Root>
                        <TextInput.Root size="sm" type="password">
                            <TextInput.Label>type password 입니다.</TextInput.Label>
                            <TextInput.Field />
                        </TextInput.Root>

                        <TextInput.Root size="md" type="text">
                            <TextInput.Label>type text 입니다.</TextInput.Label>
                            <TextInput.Field />
                        </TextInput.Root>
                        <TextInput.Root size="md" type="password">
                            <TextInput.Label>type password 입니다.</TextInput.Label>
                            <TextInput.Field />
                        </TextInput.Root>

                        <TextInput.Root size="lg" type="text">
                            <TextInput.Label>type text 입니다.</TextInput.Label>
                            <TextInput.Field />
                        </TextInput.Root>
                        <TextInput.Root size="lg" type="password">
                            <TextInput.Label>type password 입니다.</TextInput.Label>
                            <TextInput.Field />
                        </TextInput.Root>

                        <TextInput.Root size="xl" type="text">
                            <TextInput.Label>type text 입니다.</TextInput.Label>
                            <TextInput.Field />
                        </TextInput.Root>
                        <TextInput.Root size="xl" type="password">
                            <TextInput.Label>type password 입니다.</TextInput.Label>
                            <TextInput.Field />
                        </TextInput.Root>
                    </RenderingTemplate.Component>
                </RenderingTemplate>

                <RenderingTemplate>
                    <RenderingTemplate.Title title="Text - heading" />
                    <RenderingTemplate.Component rows={6} gap="0.5rem">
                        <Text typography="heading1">heading1</Text>
                        <Text typography="heading2">heading2</Text>
                        <Text typography="heading3">heading3</Text>
                        <Text typography="heading4">heading4</Text>
                        <Text typography="heading5">heading5</Text>
                        <Text typography="heading6">heading6</Text>
                    </RenderingTemplate.Component>
                </RenderingTemplate>

                <RenderingTemplate>
                    <RenderingTemplate.Title title="Text - body" />
                    <RenderingTemplate.Component rows={6} gap="0.5rem">
                        <Text typography="body1">body1</Text>
                        <Text typography="body2">body2</Text>
                        <Text typography="body3">body3</Text>
                        <Text typography="body4">body4</Text>
                    </RenderingTemplate.Component>
                </RenderingTemplate>

                <RenderingTemplate>
                    <RenderingTemplate.Title title="Text - subtitle" />
                    <RenderingTemplate.Component rows={6} gap="0.5rem">
                        <Text typography="subtitle1">subtitle1</Text>
                        <Text typography="subtitle2">subtitle2</Text>
                    </RenderingTemplate.Component>
                </RenderingTemplate>
            </section>
        </PageWrapper>
    );
};

export default Page;
