/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
		animation: {
			'blink': 'blink 1s linear infinite',
		},
		keyframes: {
			'blink': {
				'0%': { opacity: 0 },
				'50%': { opacity: 1 },
				'100%': { opacity: 0 },
			},
		},
    extend: {},
  },
  plugins: [],
}

