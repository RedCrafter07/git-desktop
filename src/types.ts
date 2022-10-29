interface Settings {
	savePath: string;
	theme: string;
	lang: string;
	defaultBranchName: string;
	sidebarWidth: string;
	repositories: Repository[];
	lastRepo?: string;
}

interface Repository {
	name: string;
	path: string;
	remote: {
		isRemote: boolean;
		url: string;
	};
	branches: Branch[];
}

interface Branch {
	name: string;
	localName: string;
}
