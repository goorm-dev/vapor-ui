// @prettier-ignore
// ⚠️ IMPORTANT: The import order is crucial to avoid circular dependencies.
// 1. Define CSS layers (must be first)
import './global-var.css';
// 2. Global reset styles
import './global.css';
import './layers.css';
// 5. Utility styles
import './sprinkles.css';
// 4. Assign theme values (after the contract is created)
import './theme.css';
// 3. Create CSS variable contract
import './vars.css';


import '../components/avatar/avatar.css';
import '../components/badge/badge.css';
import '../components/button/button.css';
import '../components/callout/callout.css';
import '../components/card/card.css';
import '../components/checkbox/checkbox.css';
import '../components/dialog/dialog.css';
import '../components/grid/grid.css';
import '../components/icon-button/icon-button.css';
import '../components/nav/nav.css';
import '../components/radio-group/radio-group.css';
import '../components/switch/switch.css';
import '../components/text-input/text-input.css';
