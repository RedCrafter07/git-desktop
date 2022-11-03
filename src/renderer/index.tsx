import { createRoot } from 'react-dom/client';
import '@fontsource/figtree';
import '@fontsource/source-code-pro';
import '@fontsource/roboto';
import Wrappers from './wrappers';

const container = document.getElementById('root')!;
const root = createRoot(container);
root.render(<Wrappers />);
