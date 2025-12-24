import { Button, Card, Field, Form, Text, TextInput } from '@vapor-ui/core';

export default function CardBasic() {
    return (
        <Card.Root render={<Form onSubmit={(e) => e.preventDefault()} />} width="400px">
            <Card.Header>
                <Text render={<h2 />} typography="heading5">
                    Login
                </Text>
            </Card.Header>
            <Card.Body display="flex" flexDirection="column" gap="$100">
                <Field.Root>
                    <Field.Label display="flex" flexDirection="column">
                        <Text typography="subtitle2" foreground="secondary-200">
                            ID
                        </Text>
                        <TextInput type="text" placeholder="Enter your username" />
                    </Field.Label>
                </Field.Root>
                <Field.Root>
                    <Field.Label display="flex" flexDirection="column">
                        <Text typography="subtitle2" foreground="secondary-200">
                            Password
                        </Text>
                        <TextInput type="password" />
                    </Field.Label>
                </Field.Root>
            </Card.Body>
            <Card.Footer display="flex" justifyContent="flex-end">
                <Button>Login</Button>
            </Card.Footer>
        </Card.Root>
    );
}
