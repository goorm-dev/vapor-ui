import { Callout } from "@vapor-ui/core";
import { InfoIcon } from "@vapor-ui/icons";

export const App = () => {
  return (
    <Callout.Root>
      <Callout.Icon>
        <InfoIcon />
      </Callout.Icon>
      This is a basic alert message
    </Callout.Root>
  );
};
