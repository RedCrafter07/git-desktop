import { createRoot } from 'react-dom/client';
import '@fontsource/figtree';
import Wrappers from './wrappers';

const container = document.getElementById('root')!;
const root = createRoot(container);
root.render(<Wrappers />);
