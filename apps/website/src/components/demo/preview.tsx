"use client";

import * as React from "react";

interface PreviewProps {
  name: string;
}

export function Preview(props: PreviewProps) {
  const { name } = props;

  const Preview = React.useMemo(() => {
    const Component = React.lazy(() => import(`./examples/${name}.tsx`));

    if (!Component) {
      return <div>Component({name}) Not Found</div>;
    }

    return <Component />;
  }, [name]);

  return (
    <React.Suspense fallback={null}>
      <div className="not-prose example-reset example-enter min-h-[300px] w-full flex flex-col justify-center items-center">
        {Preview}
      </div>
    </React.Suspense>
  );
}
