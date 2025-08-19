'use client';

import { useLayoutEffect } from 'react';

const useIsoLayoutEffect = globalThis?.document ? useLayoutEffect : () => {};

export { useIsoLayoutEffect };
