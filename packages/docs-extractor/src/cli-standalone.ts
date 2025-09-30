#!/usr/bin/env node

import { createCliCommand } from './cli';
import { main } from './main';

// CLI 실행
createCliCommand(main).parse();