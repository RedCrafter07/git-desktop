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
	IconPlus,
} from '@tabler/icons';
import { ReactNode as Node, useEffect, useRef, useState } from 'react';
import { LoadingDiv } from './components/LoadingDiv';
import { AnimatePresence, motion } from 'framer-motion';
import Radio from './components/Radio';
import Tooltip from './components/Tooltip';
import { useHotkeys } from '@mantine/hooks';

const { ipcRenderer: ipc } = window.require('electron/renderer');

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
	const [selectedRepo, setSelectedRepo] = useState<string>();

	const [modal, setModal] = useState<
		{ component: JSX.Element; name: string } | undefined
	>();

	const translations: Record<typeof step, string> = {
		loading: 'Loading...',
		starting: 'Starting...',
		finished: 'Finished!',
	};

	const [settings, setSettings] = useState<Settings>();

	const [repos, setRepos] = useState<Repository[]>([]);

	const refetchRepos = () => {
		ipc.send('get-repositories');

		ipc.once('get-repositories', (e, repos: Repository[]) => {
			setRepos(
				repos.sort((a, b) => (a.lastEdited < b.lastEdited ? 1 : -1))
			);
		});
	};

	const Body = () => {
		return (
			<div className="h-full p-2">
				<AnimatePresence mode="wait">
					{modal && (
						<motion.div
							initial={{
								opacity: 0,
								y: 200,
							}}
							animate={{
								opacity: 1,
								y: 0,
							}}
							exit={{
								opacity: 0,
								y: 200,
							}}
							key={modal.name}
							className="z-50 fixed top-0 left-0 bg-black bg-opacity-50 w-full h-full grid place-items-center backdrop-blur-md"
						>
							<div className="bg-base-200 rounded-lg p-4 w-3/4 h-3/4">
								<div className="flex flex-row justify-end">
									<IconX
										className="opacity-50 hover:opacity-100"
										onClick={() => {
											setModal(undefined);
										}}
									/>
								</div>
								{modal.component}
							</div>
						</motion.div>
					)}
				</AnimatePresence>
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

	const AddRepoModal = () => {
		const [mode, setMode] = useState<'clone' | 'local'>('clone');
		const [repoPath, setRepoPath] = useState('');
		const [repoURL, setRepoURL] = useState('');
		const [error, setError] = useState<string | undefined>(undefined);

		return (
			<div>
				<h1>{mode == 'clone' ? 'Clone' : 'Add'} a repository</h1>
				<p>How would you like to add it?</p>

				<Radio
					type="radio"
					name="mode"
					id="clone"
					value="clone"
					checked={mode === 'clone'}
					onChange={() => setMode('clone')}
					label="Clone from a remote"
				/>
				<Radio
					type="radio"
					name="mode"
					id="local"
					value="local"
					checked={mode === 'local'}
					onChange={() => setMode('local')}
					label="Add a local repo"
				/>

				<div className="my-4" />

				{mode === 'clone' ? (
					<>
						<p>Enter a URL to clone</p>
						<div className="flex flex-row gap-2">
							<input
								type="text"
								className="input flex-grow"
								placeholder="https://github.com/RedCrafter07/git-desktop.git"
								value={repoURL}
								onChange={(e) => {
									setRepoURL(e.target.value);
								}}
							/>
						</div>
						<br />
						<div className="flex flex-row gap-2">
							<input
								type="text"
								className="input flex-grow"
								placeholder="G:\GitDesktop\projects\git-desktop"
								value={repoPath}
								onChange={(e) => {
									setRepoPath(e.target.value);
								}}
							/>
							<button
								className="btn btn-primary"
								onClick={() => {
									ipc.send(
										'open-clone-folder-dialog',
										repoPath
									);

									ipc.once(
										'open-clone-folder-dialog',
										(
											_e,
											{
												isEmpty,
												path,
											}: {
												path: string;
												isEmpty: boolean;
											}
										) => {
											if (!path) return;
											if (!isEmpty) {
												setError('Folder is not empty');
												return;
											}
											setRepoPath(path);
										}
									);
								}}
							>
								Find
							</button>
						</div>
						<br />
						<button
							className="btn btn-block btn-primary"
							onClick={() => {
								if (repoURL.length < 1) return;
								if (!repoURL.endsWith('.git')) {
									setError('The URL must end with .git');
									return;
								}

								ipc.send('clone-repository', repoURL, repoPath);
								ipc.once(
									'clone-repository',
									(
										_e,
										data: {
											error: string | null;
											success: boolean;
										}
									) => {
										if (!data.success && data.error) {
											setError(data.error);
										} else {
											setModal(undefined);
											refetchRepos();
										}
									}
								);
							}}
							disabled={
								repoURL.length == 0 ||
								!repoURL.endsWith('.git') ||
								repoPath.length == 0
							}
						>
							Clone
						</button>
						{error && <p className="text-error">{error}</p>}
					</>
				) : (
					<>
						<p>Select a folder or type in the path.</p>
						<div className="flex flex-row gap-2">
							<input
								type="text"
								className="input flex-grow"
								placeholder="G:\GitDesktop\Project"
								value={repoPath}
								onChange={(e) => setRepoPath(e.target.value)}
							/>
							<button
								className="btn btn-info"
								onClick={() => {
									ipc.send('open-git-folder-dialog');

									ipc.once(
										'open-git-folder-dialog',
										(
											_e,
											data: {
												path: string;
												isRepo: boolean;
											}
										) => {
											console.log(data);
											setRepoPath(data.path);
											if (data.isRepo) {
												setError(undefined);
											} else {
												setError(
													'This folder is not a git repo.'
												);
											}
										}
									);
								}}
							>
								Find
							</button>
							<button
								className="btn btn-success"
								disabled={!!error || !repoPath}
								onClick={() => {
									if (!repoPath) return;
									ipc.send('add-repository', repoPath);

									ipc.once('add-repository', (_e, data) => {
										if (data.error) {
											setError(data.error);
										} else {
											setModal(undefined);
											setError(undefined);
											refetchRepos();
										}
									});
								}}
							>
								Accept
							</button>
						</div>
						<div className="my-2" />

						{error && <p className="text-error">{error}</p>}

						<AnimatePresence>
							{error == 'This folder is not a git repo.' && (
								<motion.button
									initial={{
										opacity: 0,
									}}
									animate={{
										opacity: 1,
									}}
									exit={{
										opacity: 0,
									}}
									transition={{
										duration: 0.3,
									}}
									className="btn btn-block btn-warning"
									onClick={() => {
										ipc.send('init-repository', repoPath);

										ipc.once(
											'init-repository',
											(_e, initialized: boolean) => {
												if (initialized) {
													setError(undefined);
												} else {
													setError(
														'Failed to initialize the repository.'
													);
												}
											}
										);
									}}
								>
									Initialize Git Repository
								</motion.button>
							)}
						</AnimatePresence>
					</>
				)}
			</div>
		);
	};

	const Sidebar = () => {
		const ModeRepos = () => {
			return (
				<div className="h-full">
					<div className="flex flex-row items-start repo-card">
						<IconPlus />
						<div
							className="ml-2"
							onClick={() => {
								setModal({
									name: 'add-repo',
									component: <AddRepoModal />,
								});
							}}
						>
							Add Repository
						</div>
					</div>

					{repos.map((repo, i) => {
						const remoteTypes = [
							...new Set(repo.remotes.map((r) => r.type)),
						];

						let Icon: TablerIcon = IconBrandGit;

						let url: string = 'Local';

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
									Icon = IconServer2;
									break;
							}
							url = repo.remotes[0].url;
						} else if (remoteTypes.length > 1) {
							Icon = IconServer2;

							url = 'Multiple remotes';
						}

						return (
							<div
								className="flex flex-col items-start justify-between repo-card"
								key={`repo-${i}`}
							>
								<div className="flex flex-row items-center">
									<Tooltip
										label={url}
										withArrow
										position="right"
									>
										<div>
											<Icon size={20} />
										</div>
									</Tooltip>
									<Tooltip
										label={repo.path}
										withArrow
										position="right"
									>
										<div className="ml-2">{repo.name}</div>
									</Tooltip>
								</div>
							</div>
						);
					})}
				</div>
			);
		};

		const ModeChanges = () => {
			return <></>;
		};

		return (
			<div>
				<div className="grid grid-cols-2 text-center h-12 border-b border-white border-opacity-5 max-h-min overflow-y-auto">
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
				{sidebarMode == 'changes' ? <ModeChanges /> : <ModeRepos />}
			</div>
		);
	};

	useEffect(() => {
		ipc.send('window-ready');

		ipc.on('load-settings', (e, value: Settings) => {
			setSettings(value);
			setStep('starting');

			ipc.removeListener('load-settings', () => {});
		});
	}, []);

	useEffect(() => {
		if (settings && step != 'finished') {
			setStep('finished');
			refetchRepos();
			setTimeout(() => {
				setLoading(false);
			}, 1000);
			return;
		}

		ipc.send('save-settings', settings);
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
	useHotkeys([
		[
			'ctrl+shift+alt+c',
			() => {
				ipc.send('open-config');
			},
		],
	]);

	return (
		<div className="flex flex-col h-screen text-base-content bg-base-300">
			<div className="webkit-drag h-8 flex flex-row items-center justify-between z-[420]">
				<div className="px-2 flex flex-row space-x-1">
					<IconBrandGit />
					<IconDeviceDesktop />
					<p>Git Desktop</p>
				</div>
				<div className="webkit-none flex flex-row">
					<div
						className="menu-button"
						onClick={() => {
							ipc.send('minimize');
						}}
					>
						<IconMinus />
					</div>
					<div
						className="menu-button"
						onClick={() => {
							ipc.send('maximize');
						}}
					>
						<IconMaximize />
					</div>
					<div
						className="menu-close-button"
						onClick={() => {
							ipc.send('close');
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
