import { Tooltip as MantineTooltip } from '@mantine/core';

export default function Tooltip(props: {
	label: string;
	withArrow?: boolean;
	children: React.ReactNode;
}) {
	const { children, label, withArrow } = props;
	return (
		<MantineTooltip
			label={label}
			withinPortal
			withArrow={withArrow}
			classNames={{
				tooltip: 'bg-base-200 border-base-100 border text-base-content',
			}}
		>
			{children}
		</MantineTooltip>
	);
}
