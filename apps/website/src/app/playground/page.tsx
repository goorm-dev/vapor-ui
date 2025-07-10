'use client';

import { Avatar, Badge, Button, Card, Checkbox, Dialog, IconButton, Text } from '@vapor-ui/core';
import { EditIcon, OpenInNewOutlineIcon } from '@vapor-ui/icons';
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
                    <RenderingTemplate.Component isGrid>
                        <Avatar.Simple
                            size="xl"
                            src="https://statics.goorm.io/gds/resources/brand-images/light/favi_goorm.svg"
                            alt="vapor-ui"
                        />
                        <Avatar.Simple
                            size="lg"
                            src="https://statics.goorm.io/gds/resources/brand-images/light/favi_goorm.svg"
                            alt="vapor-ui"
                        />
                        <Avatar.Simple
                            size="md"
                            src="https://statics.goorm.io/gds/resources/brand-images/light/favi_goorm.svg"
                            alt="vapor-ui"
                        />
                        <Avatar.Simple
                            size="sm"
                            src="https://statics.goorm.io/gds/resources/brand-images/light/favi_goorm.svg"
                            alt="vapor-ui"
                        />
                        <Avatar.Simple
                            shape="square"
                            size="xl"
                            src="https://statics.goorm.io/gds/resources/brand-images/light/favi_goorm.svg"
                            alt="vapor-ui"
                        />
                        <Avatar.Simple
                            shape="square"
                            size="lg"
                            src="https://statics.goorm.io/gds/resources/brand-images/light/favi_goorm.svg"
                            alt="vapor-ui"
                        />
                        <Avatar.Simple
                            shape="square"
                            size="md"
                            src="https://statics.goorm.io/gds/resources/brand-images/light/favi_goorm.svg"
                            alt="vapor-ui"
                        />
                        <Avatar.Simple
                            shape="square"
                            size="sm"
                            src="https://statics.goorm.io/gds/resources/brand-images/light/favi_goorm.svg"
                            alt="vapor-ui"
                        />
                    </RenderingTemplate.Component>
                </RenderingTemplate>

                <RenderingTemplate>
                    <RenderingTemplate.Title title="Badge" />
                    <RenderingTemplate.Component>
                        <Badge>Badge</Badge>
                    </RenderingTemplate.Component>
                </RenderingTemplate>

                <RenderingTemplate>
                    <RenderingTemplate.Title title="Button" />
                    <RenderingTemplate.Component>
                        <Button>BUTTON</Button>
                    </RenderingTemplate.Component>
                </RenderingTemplate>

                <RenderingTemplate>
                    <RenderingTemplate.Title title="Card" />
                    <RenderingTemplate.Component>
                        <Card.Root>
                            <Card.Header>Basic Template</Card.Header>
                            <Card.Body>This is a Basic Template</Card.Body>
                            <Card.Footer>
                                <Button size="lg" color="secondary">
                                    BUTTON
                                </Button>
                                <Button size="lg" color="primary">
                                    BUTTON
                                </Button>
                            </Card.Footer>
                        </Card.Root>
                    </RenderingTemplate.Component>
                </RenderingTemplate>

                <RenderingTemplate>
                    <RenderingTemplate.Title title="Checkbox" />
                    <RenderingTemplate.Component>
                        <Checkbox.Root id="checkbox">
                            <Checkbox.Control />
                            <Checkbox.Label htmlFor="checkbox">Checkbox</Checkbox.Label>
                        </Checkbox.Root>
                    </RenderingTemplate.Component>
                </RenderingTemplate>

                <RenderingTemplate>
                    <RenderingTemplate.Title title="Dialog" />
                    <RenderingTemplate.Component>
                        <Dialog.Root>
                            <Dialog.Trigger>
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
                    <RenderingTemplate.Component>
                        <IconButton aria-label="아이콘 버튼" icon={EditIcon} />
                    </RenderingTemplate.Component>
                </RenderingTemplate>

                {/* <RenderingTemplate>
                    <RenderingTemplate.Title title="Label" />
                    <RenderingTemplate.Component>
                        <Label>라벨입니다.</Label>
                    </RenderingTemplate.Component>
                </RenderingTemplate>

                <RenderingTemplate>
                    <RenderingTemplate.Title title="SearchInput" />
                    <RenderingTemplate.Component>
                        <SearchInput>
                            <SearchInput.Label htmlFor="vapor">Label</SearchInput.Label>
                            <SearchInput.Field id="vapor" placeholder="안녕하세요." />
                        </SearchInput>
                    </RenderingTemplate.Component>
                </RenderingTemplate>

                <RenderingTemplate>
                    <RenderingTemplate.Title title="Switch" />
                    <RenderingTemplate.Component>
                        <Switch>
                            <Switch.Indicator />
                        </Switch>
                    </RenderingTemplate.Component>
                </RenderingTemplate>

                <RenderingTemplate>
                    <RenderingTemplate.Title title="Tabs" />
                    <RenderingTemplate.Component>
                        <Tabs>
                            <Tabs.List>
                                <Tabs.Button value="Apple">Apple</Tabs.Button>
                                <Tabs.Button value="Grape">Grape</Tabs.Button>
                                <Tabs.Button value="Kiwi">Kiwi</Tabs.Button>
                                <Tabs.Button value="onion" disabled>
                                    onion
                                </Tabs.Button>
                            </Tabs.List>
                            <Tabs.Panel value="Apple">사과입니다.</Tabs.Panel>
                            <Tabs.Panel value="Grape">포도입니다.</Tabs.Panel>
                            <Tabs.Panel value="Kiwi">키위입니다.</Tabs.Panel>
                            <Tabs.Panel value="onion">양파입니다.</Tabs.Panel>
                        </Tabs>
                    </RenderingTemplate.Component>
                </RenderingTemplate> */}

                <RenderingTemplate>
                    <RenderingTemplate.Title title="Text" />
                    <RenderingTemplate.Component>
                        <div
                            style={{
                                display: 'flex',
                                flexDirection: 'column',
                                gap: '0.25rem',
                            }}
                        >
                            <Text typography="heading1">heading1</Text>
                            <Text typography="heading2">heading2</Text>
                            <Text typography="heading3">heading3</Text>
                            <Text typography="heading4">heading4</Text>
                            <Text typography="heading5">heading5</Text>
                            <Text typography="heading6">heading6</Text>
                            <Text typography="body1">body1</Text>
                            <Text typography="body2">body2</Text>
                            <Text typography="body3">body3</Text>
                            <Text typography="body4">body4</Text>
                            <Text typography="subtitle1">subtitle1</Text>
                            <Text typography="subtitle2">subtitle2</Text>
                        </div>
                    </RenderingTemplate.Component>
                </RenderingTemplate>

                {/* <RenderingTemplate>
                    <RenderingTemplate.Title title="TextInput" />
                    <RenderingTemplate.Component>
                        <div
                            style={{
                                display: 'flex',
                                flexDirection: 'column',
                                gap: '0.5rem',
                            }}
                        >
                            <TextInput type="text">
                                <TextInput.Label>type text 입니다.</TextInput.Label>
                                <TextInput.Field />
                            </TextInput>
                            <TextInput type="email">
                                <TextInput.Label>type email 입니다.</TextInput.Label>
                                <TextInput.Field />
                            </TextInput>
                            <TextInput type="password">
                                <TextInput.Label>type password 입니다.</TextInput.Label>
                                <TextInput.Field />
                            </TextInput>
                            <TextInput type="tel">
                                <TextInput.Label>type tel 입니다.</TextInput.Label>
                                <TextInput.Field />
                            </TextInput>
                            <TextInput type="url">
                                <TextInput.Label>type url 입니다.</TextInput.Label>
                                <TextInput.Field />
                            </TextInput>
                        </div>
                    </RenderingTemplate.Component>
                </RenderingTemplate> */}
            </section>
        </PageWrapper>
    );
};

export default Page;
