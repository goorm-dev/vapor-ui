import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';

import { darkThemeCss, lightThemeCss } from './index';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const dataDir = path.join(__dirname, 'data');
if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
}

fs.writeFileSync(path.join(dataDir, 'renewal-vapor-color-light-theme.css'), lightThemeCss);
fs.writeFileSync(path.join(dataDir, 'renewal-vapor-color-dark-theme.css'), darkThemeCss);
