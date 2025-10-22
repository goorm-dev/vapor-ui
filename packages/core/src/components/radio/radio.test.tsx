import { render } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { Radio } from '.';
import { RadioGroup } from '../radio-group';

describe('<Radio.Root />', () => {
    it('does not forward `value` prop', async () => {
        const rendered = render(
            <RadioGroup.Root value="test">
                <Radio.Root value="" />
            </RadioGroup.Root>,
        );

        const root = rendered.getByRole('radio');

        expect(root).not.toHaveAttribute('value');
    });

    it('allows `null` value', async () => {
        const name = 'test-radio-group';
        const rendered = render(
            <RadioGroup.Root name={name}>
                <Radio.Root value={null} data-testid="radio-null" />
                <Radio.Root value="a" data-testid="radio-a" />
            </RadioGroup.Root>,
        );

        const input = rendered.container.querySelector<HTMLInputElement>(`input[name="${name}"]`);
        expect(input).toBeInTheDocument();

        const radioNull = rendered.getByTestId('radio-null');
        const radioA = rendered.getByTestId('radio-a');

        await userEvent.click(radioNull);
        expect(radioNull).toHaveAttribute('aria-checked', 'true');
        expect(input).toHaveValue('');

        await userEvent.click(radioA);
        expect(radioNull).toHaveAttribute('aria-checked', 'false');
        expect(input).toHaveValue('a');
    });
});
