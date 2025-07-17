// @prettier-ignore
// ⚠️ IMPORTANT: The import order is crucial to avoid circular dependencies.
// 1. Define CSS layers (must be first)
import './global-var.css';

// 2. Global reset styles
import './global.css';
import './layers.css';

// 3. Create CSS variable contract
import './vars.css';

// 4. Assign theme values (after the contract is created)
import './theme.css';

// 5. Utility styles
import './sprinkles.css';