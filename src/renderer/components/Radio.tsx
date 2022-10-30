import React, { ReactNode as Node, useRef } from 'react';

// Get props of radio button
type DefaultRadioProps = React.DetailedHTMLProps<
	React.InputHTMLAttributes<HTMLInputElement>,
	HTMLInputElement
>;

type AdditionalProps = {
	label: string | Node;
};

export type Radio = DefaultRadioProps & AdditionalProps;

export default function Radio(props: Radio) {
	const { label, ...rest } = props;

	const radio = useRef<HTMLInputElement>(null);

	return (
		<div className="flex flex-row mb-2">
			<input
				{...rest}
				className={`${rest.className} radio`}
				ref={radio}
			/>
			<label
				onClick={() => {
					radio.current.click();
				}}
				className="ml-2 cursor-pointer my-auto"
			>
				{label}
			</label>
		</div>
	);
}
