module.exports = {
	content: ['./src/**/*.{ejs,tsx}'],
	theme: {
		extend: {},
	},
	daisyui: {
		themes: [
			{
				ocean: {
					'base-100': '#31364b',
					'base-200': '#272b3d',
					'base-300': '#232736',
					primary: '#4299E1',
					secondary: '#9F7AEA',
					accent: '#38B2AC',
					neutral: '#232736',
					info: '#00a7ff',
					success: '#2BB67D',
					warning: '#FFCC00',
					error: '#FF3434',
				},
				github: {
					'base-100': '#2f363d',
					'base-200': '#24292e',
					'base-300': '#1d2125',
					primary: '#58a6ff',
					secondary: '#6f42c1',
					accent: '#79ffe1',
					neutral: '#1d2125',
					info: '#58a6ff',
					success: '#2BB67D',
					warning: '#FFCC00',
					error: '#FF3434',
				},
			},
		],
	},
	plugins: [require('daisyui')],
};
