/* eslint-disable @typescript-eslint/no-var-requires */
/**
 * This module executes inside of electron's main process. You can start
 * electron renderer process from here and communicate with the other processes
 * through IPC.
 *
 * When running `npm run build` or `npm run build:main`, this file is compiled to
 * `./src/main.js` using webpack. This gives us some performance wins.
 */
import path from 'path';
import { app, BrowserWindow, shell, ipcMain as ipc, dialog } from 'electron';
import { autoUpdater } from 'electron-updater';
import log from 'electron-log';
import { resolveHtmlPath } from './util';
import { readdir, readFile, writeFile } from 'fs/promises';
import { simpleGit } from 'simple-git';
import moment from 'moment';
import { existsSync } from 'fs';

export default class AppUpdater {
	constructor() {
		log.transports.file.level = 'info';
		autoUpdater.logger = log;
		autoUpdater.checkForUpdatesAndNotify();
	}
}

let mainWindow: BrowserWindow | null = null;

if (process.env.NODE_ENV === 'production') {
	const sourceMapSupport = require('source-map-support');
	sourceMapSupport.install();
}

const isDebug =
	process.env.NODE_ENV === 'development' || process.env.DEBUG_PROD === 'true';

if (isDebug) {
	require('electron-debug')();
}

const installExtensions = async () => {
	const installer = require('electron-devtools-installer');
	const forceDownload = !!process.env.UPGRADE_EXTENSIONS;
	const extensions = ['REACT_DEVELOPER_TOOLS'];

	return installer
		.default(
			extensions.map((name) => installer[name]),
			forceDownload
		)
		.catch(console.log);
};

const savePath = app.getPath('userData');

const settingsPath = path.resolve(savePath, 'settings.gdconf');

const getSettings: () => Promise<Settings> = async () => {
	try {
		const settings: Settings = JSON.parse(
			await readFile(settingsPath, { encoding: 'utf-8' })
		);
		return settings;
	} catch (error) {
		const settings: Settings = {
			savePath: app.getPath('documents'),
			theme: 'dark',
			lang: 'en',
			defaultBranchName: 'main',
			sidebarWidth: '240px',
			repositories: [],
			autoSwitchToChangesTab: true,
			autoSwitchToLastRepo: true,
		};
		return settings;
	}
};

const saveSettings = async (settings: Settings) => {
	if (settings == undefined) return;

	try {
		await writeFile(settingsPath, await JSON.stringify(settings));
	} catch (error) {
		console.log(error);
	}
};

ipc.on('window-ready', async (e) => {
	const settings: Settings = await getSettings();

	e.reply('load-settings', settings);
});

ipc.on(
	'save-setting',
	async <T extends keyof Settings>(
		e: Electron.IpcMainEvent,
		setting: T,
		value: Settings[T]
	) => {
		const settings = await getSettings();

		settings[setting] = value;

		await saveSettings(settings);
	}
);

ipc.on('save-settings', async (e, settings: Settings) => {
	const oldSettings = await getSettings();
	const { repositories, ...rest } = settings;
	const newSettings = { ...oldSettings, ...rest };
	await saveSettings(newSettings);
});

ipc.on('check-repository', async (e, path: string) => {
	const git = simpleGit(path);
	const isRepo = await git.checkIsRepo();
	e.reply('check-repository', isRepo);
});

ipc.on('init-repository', async (e, path: string) => {
	const git = simpleGit(path);
	await git.init();

	if (await git.checkIsRepo()) {
		e.reply('init-repository', true);
	}

	e.reply('init-repository', true);
});

ipc.on('clone-repository', async (e, url: string, path: string) => {
	const git = simpleGit(path);

	try {
		await git.clone(url, path);
	} catch (e) {
		console.log(e);
		e.reply('clone-repository', { success: false, error: e });
	}

	const settings = await getSettings();

	const remotes = await git.getRemotes(true);

	settings.repositories.push({
		path,
		name: url.split('/').pop().split('.').slice(0, -1).join('.'),
		lastEdited: moment().unix(),
		remotes: remotes.map((r) => ({
			name: r.name,
			type: r.refs.fetch.split('/')[2].split('.')[0] as Remote['type'],
			url: r.refs.fetch,
		})),
	});

	await saveSettings(settings);

	e.reply('clone-repository', { success: true, error: null });
});

ipc.on('open-git-folder-dialog', async (e, path: string) => {
	const result = await dialog.showOpenDialog(mainWindow, {
		properties: ['openDirectory'],
		defaultPath: path,
	});

	if (result.canceled) return;

	const git = simpleGit(result.filePaths[0]);
	const isRepo = await git.checkIsRepo();

	e.reply('open-git-folder-dialog', {
		path: result.filePaths[0],
		isRepo,
	});
});

ipc.on('open-clone-folder-dialog', async (e) => {
	const result = await dialog.showOpenDialog(mainWindow, {
		properties: ['openDirectory', 'promptToCreate'],
	});
	if (result.canceled) return;

	// check if directory has content
	const files = await readdir(result.filePaths[0]);
	if (files.length > 0) {
		e.reply('open-clone-folder-dialog', {
			path: result.filePaths[0],
			isEmpty: false,
		});
	}

	e.reply('open-clone-folder-dialog', {
		path: result.filePaths[0],
		isEmpty: true,
	});
});

ipc.on('open-config', async () => {
	shell.openExternal(settingsPath);
});

ipc.on('add-repository', async (e, path: string) => {
	const settings = await getSettings();

	// Check if there is a git repository initialized
	const git = simpleGit(path, { binary: 'git' });

	const isRepo = await git.checkIsRepo();

	if (!isRepo) {
		e.reply('add-repository', { error: 'Not a git repository' });
		return;
	}

	if (settings.repositories.filter((repo) => repo.path === path).length > 0)
		return;

	const remotes = await git.getRemotes(true);

	settings.repositories.push({
		path,
		name: path.split('\\').pop(),
		remotes: remotes.map((r) => {
			//type has to be github, gitlab, bitbucket or other
			const type = r.refs.fetch.split('/')[2].split('.')[0];

			return {
				name: r.name,
				url: r.refs.fetch,
				type: type as 'github' | 'gitlab' | 'bitbucket' | 'other',
			};
		}),
		lastEdited: moment().unix(),
	});

	await saveSettings(settings);

	e.reply('add-repository', { path });
});

ipc.on('get-repositories', async (e) => {
	const settings = await getSettings();

	e.reply('get-repositories', settings.repositories);
});

ipc.on('minimize', () => {
	mainWindow?.minimize();
});

ipc.on('maximize', () => {
	if (mainWindow?.isMaximized()) {
		mainWindow?.unmaximize();
	} else {
		mainWindow?.maximize();
	}
});

ipc.on('close', () => {
	mainWindow?.close();
});

const createWindow = async () => {
	if (isDebug) {
		await installExtensions();
	}

	const RESOURCES_PATH = app.isPackaged
		? path.join(process.resourcesPath, 'assets')
		: path.join(__dirname, '../../assets');

	const getAssetPath = (...paths: string[]): string => {
		return path.join(RESOURCES_PATH, ...paths);
	};

	mainWindow = new BrowserWindow({
		show: false,
		width: 1200,
		height: 890,
		minWidth: 1024,
		minHeight: 728,
		icon: getAssetPath('icon.png'),
		webPreferences: {
			nodeIntegration: true,
			contextIsolation: false,
		},
		roundedCorners: true,
		frame: false,
		backgroundColor: '#000',
	});

	mainWindow.loadURL(resolveHtmlPath('index.html'));

	mainWindow.on('ready-to-show', () => {
		if (!mainWindow) {
			throw new Error('"mainWindow" is not defined');
		}

		if (process.env.START_MINIMIZED) {
			mainWindow.minimize();
		} else {
			mainWindow.show();
		}
	});

	mainWindow.on('closed', () => {
		mainWindow = null;
	});

	// Open urls in the user's browser
	mainWindow.webContents.setWindowOpenHandler((edata) => {
		shell.openExternal(edata.url);
		return { action: 'deny' };
	});

	// Remove this if your app does not use auto updates
	// eslint-disable-next-line
	new AppUpdater();
};

/**
 * Add event listeners...
 */

app.on('window-all-closed', () => {
	// Respect the OSX convention of having the application in memory even
	// after all windows have been closed
	if (process.platform !== 'darwin') {
		app.quit();
	}
});

app.whenReady()
	.then(() => {
		createWindow();
		app.on('activate', () => {
			// On macOS it's common to re-create a window in the app when the
			// dock icon is clicked and there are no other windows open.
			if (mainWindow === null) createWindow();
		});
	})
	.catch(console.log);
