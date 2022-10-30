interface Settings {
	savePath: string;
	theme: string;
	lang: string;
	defaultBranchName: string;
	sidebarWidth: string;
	repositories: Repository[];
	lastRepo?: string;
	autoSwitchToLastRepo: boolean;
	autoSwitchToChangesTab: boolean;
}

interface Repository {
	name: string;
	path: string;
	remotes: Remote[];
	lastEdited: number;
}

interface Branch {
	name: string;
	localName: string;
}

interface Remote {
	name: string;
	url: string;
	type: 'github' | 'gitlab' | 'bitbucket' | 'other';
}
