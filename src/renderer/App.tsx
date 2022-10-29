import './App.css';
import { IconMaximize, IconX, IconMinus } from '@tabler/icons';
import { ReactNode as Node } from 'react';
import { LoadingDiv } from './components/LoadingDiv';

const { ipcRenderer } = window.require('electron/renderer');

const Skeleton = (props: { head?: Node; side?: Node; body?: Node }) => {
	const { body, head, side } = props;
	return (
		<div className="flex flex-col h-full" data-theme="acrylic">
			<div className="h-16 bg-base-200">{head}</div>
			<div className="bg-base-300 flex-grow flex flex-row">
				<div className="w-60 bg-base-100">{side}</div>
				<div className="flex-grow bg-base-300 border-t border-l border-white border-opacity-5">
					{body}
				</div>
			</div>
		</div>
	);
};

const Content = () => {
	return <Skeleton body={<LoadingDiv text="Loading Git Desktop..." />} />;
};

const App = () => {
	return (
		<div className="flex flex-col h-screen text-base-content bg-base-300">
			<div className="webkit-drag h-8 flex flex-row items-center justify-between">
				<div className="px-2">Git Desktop</div>
				<div className="webkit-none flex flex-row">
					<div
						className="menu-button"
						onClick={() => {
							ipcRenderer.send('minimize');
						}}
					>
						<IconMinus />
					</div>
					<div
						className="menu-button"
						onClick={() => {
							ipcRenderer.send('maximize');
						}}
					>
						<IconMaximize />
					</div>
					<div
						className="menu-close-button"
						onClick={() => {
							ipcRenderer.send('close');
						}}
					>
						<IconX />
					</div>
				</div>
			</div>
			<div className="flex-grow">
				<Content />
			</div>
		</div>
	);
};

export default App;
