import { MantineProvider } from '@mantine/core';
import App from './App';

export default function Wrappers() {
	return (
		<>
			<MantineProvider theme={{ colorScheme: 'dark' }}>
				<App />
			</MantineProvider>
		</>
	);
}
