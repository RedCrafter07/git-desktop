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
	remotes: {
		name: string;
		url: string;
		type: 'github' | 'gitlab' | 'bitbucket' | 'other';
	}[];
	branches: Branch[];
}

interface Branch {
	name: string;
	localName: string;
}
