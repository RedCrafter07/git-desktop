import './App.css';
import {
	IconMaximize,
	IconX,
	IconMinus,
	IconBrandGit,
	IconDeviceDesktop,
	IconFileDiff,
	IconBook2,
	TablerIcon,
	IconBrandGithub,
	IconBrandBitbucket,
	IconBrandGitlab,
	IconServer2,
} from '@tabler/icons';
import { ReactNode as Node, useEffect, useRef, useState } from 'react';
import { LoadingDiv } from './components/LoadingDiv';
import { useDebouncedState, useSetState } from '@mantine/hooks';
import { AnimatePresence, motion } from 'framer-motion';

const { ipcRenderer } = window.require('electron/renderer');

// From: https://stackoverflow.com/a/53276873/13411306
/**
 * @description A type like Record but all values are optional
 * @see https://stackoverflow.com/a/53276873/13411306
 * @example const myType: OptionalRecord<'a' | 'b', number> = { a?: number; b?: number } = { a: 1 }
 */
export type OptionalRecord<K extends keyof any, T> = {
	[P in K]?: T;
};

const Skeleton = (props: {
	head?: Node;
	side?: Node;
	body?: Node;
	sidebarWidth: string;
	widthSetter: (width: string) => void;
}) => {
	const { body, head, side, sidebarWidth, widthSetter } = props;

	const sidebarRef = useRef<HTMLDivElement>(null);

	useEffect(() => {
		const ro = new ResizeObserver((entries) => {
			const w = entries[0].contentRect.width;

			widthSetter(`${w}px`);
		});

		ro.observe(sidebarRef.current);
	}, [sidebarRef]);

	return (
		<div className="bg-base-300 flex-grow flex flex-row h-full w-full">
			<div
				className={`bg-base-200 resize-x overflow-auto max-w-[75%] min-w-[240px] border-r border-white border-opacity-5`}
				style={{
					width: sidebarWidth,
				}}
				ref={sidebarRef}
			>
				{side}
			</div>
			<div className="flex flex-col h-full w-full">
				<div className="h-12 bg-base-200 border-b border-white border-opacity-5">
					{head}
				</div>
				<div className="flex-grow bg-base-300">{body}</div>
			</div>
		</div>
	);
};

const Content = () => {
	const [step, setStep] = useState<'loading' | 'starting' | 'finished'>(
		'loading'
	);
	const [loading, setLoading] = useState(true);
	const [sidebarMode, setSidebarMode] = useState<'repos' | 'changes'>(
		'repos'
	);

	const translations: Record<typeof step, string> = {
		loading: 'Loading...',
		starting: 'Starting...',
		finished: 'Finished!',
	};

	const [settings, setSettings] = useState<Settings>();
	const Body = () => {
		return (
			<div className="h-full p-2">
				{!loading ? (
					<div>
						<h1>Hi</h1>
					</div>
				) : (
					<LoadingDiv
						text={translations[step]}
						withGit={true}
						key={'loader'}
					/>
				)}
			</div>
		);
	};

	const Sidebar = () => {
		const ModeRepos = () => {
			return (
				<div className="flex flex-col h-full">
					{(settings?.repositories ? settings.repositories : []).map(
						(repo, i) => {
							const remoteTypes = [
								...new Set(repo.remotes.map((r) => r.type)),
							];

							let Icon: TablerIcon = IconDeviceDesktop;

							if (remoteTypes.length === 1) {
								switch (remoteTypes[0]) {
									case 'bitbucket':
										Icon = IconBrandBitbucket;
										break;
									case 'github':
										Icon = IconBrandGithub;
										break;
									case 'gitlab':
										Icon = IconBrandGitlab;
										break;
									default:
										Icon = IconBrandGit;
										break;
								}
							} else if (remoteTypes.length > 1) {
								Icon = IconServer2;
							}

							return (
								<div
									className="flex flex-col items-start justify-between p-2 border-b border-white border-opacity-5"
									key={`repo-${i}`}
								>
									<div className="flex flex-row items-center">
										<Icon size={20} />
										<div className="ml-2">{repo.name}</div>
									</div>
									<div className="flex flex-row items-center"></div>
								</div>
							);
						}
					)}
				</div>
			);
		};

		return (
			<div>
				<div className="grid grid-cols-2 text-center h-12 border-b border-white border-opacity-5">
					<div
						onClick={() => {
							setSidebarMode('repos');
						}}
						className={`${
							sidebarMode == 'repos'
								? 'bg-base-100'
								: 'bg-base-200'
						} h-full flex cursor-pointer`}
					>
						<p className="m-auto flex flex-row space-x-2">
							<IconBook2 /> Repos
						</p>
					</div>
					<div
						onClick={() => {
							setSidebarMode('changes');
						}}
						className={`${
							sidebarMode == 'changes'
								? 'bg-base-100'
								: 'bg-base-200'
						} h-full flex cursor-pointer`}
					>
						<p className="m-auto flex flex-row space-x-2">
							<IconFileDiff /> Changes
						</p>
					</div>
				</div>
				<ModeRepos />
			</div>
		);
	};

	useEffect(() => {
		ipcRenderer.send('window-ready');

		ipcRenderer.on('load-settings', (e, value: Settings) => {
			setSettings(value);
			setStep('starting');

			ipcRenderer.removeListener('load-settings', () => {});
		});
	}, []);

	useEffect(() => {
		if (settings && step != 'finished') {
			setStep('finished');
			setTimeout(() => {
				setLoading(false);
				ipcRenderer.send(
					'add-repository',
					'D:\\Programming\\Github\\git-desktop'
				);
			}, 1000);
			return;
		}

		ipcRenderer.send('save-settings', settings);
	}, [settings]);

	const widthSetter = (width: string) => {
		setSettings((s) => ({ ...s, sidebarWidth: width }));
	};

	return (
		<Skeleton
			body={<Body />}
			side={<Sidebar />}
			sidebarWidth={settings?.sidebarWidth ?? '15rem'}
			widthSetter={widthSetter}
		/>
	);
};

const App = () => {
	return (
		<div className="flex flex-col h-screen text-base-content bg-base-300">
			<div className="webkit-drag h-8 flex flex-row items-center justify-between">
				<div className="px-2 flex flex-row space-x-1">
					<IconBrandGit />
					<IconDeviceDesktop />
					<p>Git Desktop</p>
				</div>
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
