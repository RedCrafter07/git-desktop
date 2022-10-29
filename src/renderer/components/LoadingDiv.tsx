import { Loading, LoadingProps } from '@nextui-org/react';
import { IconBrandGit, IconDeviceDesktop } from '@tabler/icons';

export const LoadingDiv = (props: {
	type?: LoadingProps['type'];
	text?: string;
	withGit?: boolean;
}) => {
	const { text, type, withGit } = props;
	return (
		<div className="grid place-items-center h-full">
			<div className="flex flex-col align-center space-y-4 text-center">
				<Loading
					type={type || 'points-opacity'}
					color="currentColor"
					size="xl"
				/>
				{text && <h3>{text}</h3>}
				{withGit && (
					<div className="flex flex-row space-x-1 mx-auto opacity-50">
						<IconBrandGit />
						<IconDeviceDesktop />
						<p>Git Desktop</p>
					</div>
				)}
			</div>
		</div>
	);
};
