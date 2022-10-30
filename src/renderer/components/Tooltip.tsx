import { Tooltip as MantineTooltip, TooltipProps } from '@mantine/core';

export default function Tooltip(props: {
	label: string;
	withArrow?: boolean;
	children: React.ReactNode;
	position?: TooltipProps['position'];
}) {
	const { children, label, withArrow, position } = props;
	return (
		<MantineTooltip
			label={label}
			withinPortal
			withArrow={withArrow}
			classNames={{
				tooltip: 'bg-base-200 border-base-100 border text-base-content',
			}}
			position={position}
		>
			{children}
		</MantineTooltip>
	);
}
