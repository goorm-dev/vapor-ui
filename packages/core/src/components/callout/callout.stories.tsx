import type { Meta, StoryObj } from '@storybook/react-vite';
import { CheckboxIcon, CloseOutlineIcon } from '@vapor-ui/icons';

import { Flex } from '../flex';
import { Callout } from './callout';

export default {
    title: 'Callout',
    component: Callout.Root,
    argTypes: {
        color: {
            control: 'inline-radio',
            options: ['primary', 'success', 'warning', 'danger', 'hint', 'contrast'],
        },
    },
} satisfies Meta<typeof Callout.Root>;

type Story = StoryObj<typeof Callout.Root>;

export const Default: Story = {
    render: (args) => <Callout.Root {...args}>Anyone can develop</Callout.Root>,
};

export const TestBed: Story = {
    render: () => (
        <Flex style={{ flexDirection: 'column', gap: 'var(--vapor-size-dimension-150)' }}>
            <Callout.Root color="primary">Anyone can develop</Callout.Root>
            <Callout.Root color="success">Anyone can develop</Callout.Root>
            <Callout.Root color="warning">Anyone can develop</Callout.Root>
            <Callout.Root color="danger">Anyone can develop</Callout.Root>
            <Callout.Root color="hint">Anyone can develop</Callout.Root>
            <Callout.Root color="contrast">Anyone can develop</Callout.Root>

            <Callout.Root color="success">
                <Callout.Icon>
                    <CheckboxIcon />
                </Callout.Icon>
                Success operation completed
            </Callout.Root>
            <Callout.Root color="danger">
                <Callout.Icon>
                    <CloseOutlineIcon />
                </Callout.Icon>
                Lorem ipsum dolor sit amet consectetur adipisicing elit. Cumque qui quaerat eius
                repellendus provident autem rem optio quisquam minus facilis, quia ullam pariatur
                harum amet maiores dicta aut ipsa quis ipsam dolores atque eligendi neque vero unde.
                Officiis modi voluptatibus exercitationem aliquam deleniti ex labore quae assumenda
                sint delectus neque autem ipsum vero excepturi, et omnis dolorem quia qui iste. Quis
                tenetur, optio culpa asperiores error quia distinctio odio incidunt atque at nihil
                voluptates, id possimus tempora nostrum soluta corrupti temporibus, reiciendis
                dolorum? Non repellendus magni repudiandae omnis harum obcaecati ea reprehenderit
                numquam accusantium sequi, ratione cum! Ipsa voluptas tenetur voluptates recusandae
                ducimus debitis eveniet consequuntur quia accusantium maxime voluptatum fugiat quos
                odio culpa non laboriosam placeat, assumenda minima amet neque magnam.
                Exercitationem porro voluptatum fuga dolore placeat atque quaerat libero maxime
                necessitatibus facilis corporis sit ut blanditiis error at, culpa eaque vel neque?
                Ab, qui commodi deserunt repellendus molestiae nostrum dignissimos, incidunt quasi
                modi, amet doloremque! Veritatis consectetur suscipit illo perferendis sunt
                exercitationem molestias dignissimos aliquam, nostrum placeat deserunt iure velit
                hic eius voluptates, aliquid a magnam, atque nulla ratione. Est explicabo molestiae
                delectus tenetur quis alias iure vel nostrum ipsum! Reprehenderit quidem quae
                expedita placeat reiciendis ipsam alias est ipsum, similique beatae laudantium
                delectus assumenda libero illo quis tempora iusto et, dolor ad rem tenetur nostrum
                molestias! Ipsum laboriosam totam molestiae incidunt, ea nihil, consequatur libero
                culpa commodi magni, quidem nemo non sit maxime quos unde? Exercitationem, tempore
                perspiciatis? Officiis, itaque, libero delectus obcaecati necessitatibus,
                repellendus neque aliquid dolores eaque ducimus veniam eum fugiat! Fugiat libero
                officiis cum excepturi assumenda aliquam repudiandae iure porro nostrum voluptatum
                tenetur itaque labore quaerat, quasi tempore! Autem provident saepe repudiandae a,
                unde deserunt magni enim fuga obcaecati perferendis rem voluptatum qui placeat alias
                eos similique accusamus non quae expedita earum eveniet omnis.
            </Callout.Root>
        </Flex>
    ),
};
