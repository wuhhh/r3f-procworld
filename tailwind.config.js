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
		fontFamily: {
			'mono': ['ballingermono'],
		},
    extend: {
			colors: {
				'spaceship-black': '#201112',
				'cloud-pink': '#EE848D',
				'pop-pink': '#ff7f91',
			}
		},
  },
  plugins: [],
}

