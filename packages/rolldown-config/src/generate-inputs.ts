import path from 'node:path';
import type { GlobOptions } from 'tinyglobby';
import { globSync } from 'tinyglobby';

type Files = string | readonly string[];

export const generateInputs = (inputs: Files, options?: GlobOptions) =>
    Object.fromEntries(
        globSync(inputs, options).map((file) => [
            path
                .relative('src', file.slice(0, file.length - path.extname(file).length))
                .split(path.sep)
                .join('/'),

            path.resolve(file),
        ]),
    );
