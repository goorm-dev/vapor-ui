import { join } from 'node:path';

import { runTestTransform } from '~/utils/test-utils';

import transform from '../index';

runTestTransform({
    transform,
    fixturesDir: join(__dirname, '..', '__testfixtures__'),
});
