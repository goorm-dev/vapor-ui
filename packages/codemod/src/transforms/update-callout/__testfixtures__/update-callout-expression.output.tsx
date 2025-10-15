import { Callout } from "@vapor-ui/core";
import { WarningIcon } from "@vapor-ui/icons";

export const App = () => {
  const message = "Dynamic message";
  return (
    <Callout.Root>
      <Callout.Icon>
        <WarningIcon />
      </Callout.Icon>
      {message}
    </Callout.Root>
  );
};
