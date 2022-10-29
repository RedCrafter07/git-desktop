import { Loading, LoadingProps } from '@nextui-org/react';

export const LoadingDiv = (props: {
	type?: LoadingProps['type'];
	text?: string;
}) => {
	const { text, type } = props;
	return (
		<div className="grid place-items-center h-full">
			<div className="flex flex-col align-center space-y-4">
				<Loading
					type={type || 'points-opacity'}
					color="currentColor"
					size="xl"
				/>
				{text && <h3>{text}</h3>}
			</div>
		</div>
	);
};
