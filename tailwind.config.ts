import type { Config } from "tailwindcss";

export default {
  darkMode: ["class"],
  content: ["./src/**/*.{ts,tsx}", "./index.html"],
  prefix: "",
  theme: {
  	container: {
  		center: true,
  		padding: '2rem',
  		screens: {
  			'2xl': '1400px'
  		}
  	},
  	extend: {
		screens: {
			'3xl': '1920px'
		},
		colors: {
			border: 'hsl(var(--border))',
			input: 'hsl(var(--input))',
			ring: 'hsl(var(--ring))',
			background: 'hsl(var(--background))',
			foreground: 'hsl(var(--foreground))',
			primary: {
				DEFAULT: 'hsl(var(--primary))',
				foreground: 'hsl(var(--primary-foreground))'
			},
			secondary: {
				DEFAULT: 'hsl(var(--secondary))',
				foreground: 'hsl(var(--secondary-foreground))'
			},
			destructive: {
				DEFAULT: 'hsl(var(--destructive))',
				foreground: 'hsl(var(--destructive-foreground))'
			},
			muted: {
				DEFAULT: 'hsl(var(--muted))',
				foreground: 'hsl(var(--muted-foreground))'
			},
			accent: {
				DEFAULT: 'hsl(var(--accent))',
				foreground: 'hsl(var(--accent-foreground))'
			},
			popover: {
				DEFAULT: 'hsl(var(--popover))',
				foreground: 'hsl(var(--popover-foreground))'
			},
			card: {
				DEFAULT: 'hsl(var(--card))',
				foreground: 'hsl(var(--card-foreground))'
			},
			sidebar: {
				DEFAULT: 'hsl(var(--sidebar-background))',
				foreground: 'hsl(var(--sidebar-foreground))',
				primary: 'hsl(var(--sidebar-primary))',
				'primary-foreground': 'hsl(var(--sidebar-primary-foreground))',
				accent: 'hsl(var(--sidebar-accent))',
				'accent-foreground': 'hsl(var(--sidebar-accent-foreground))',
				border: 'hsl(var(--sidebar-border))',
				ring: 'hsl(var(--sidebar-ring))'
			},
			clinical: {
				DEFAULT: 'hsl(var(--clinical))',
				deep: 'hsl(var(--clinical-deep))'
			},
			trust: 'hsl(var(--trust))',
			// ── Booking funnel token system ──
			surface: 'hsl(var(--surface) / <alpha-value>)',
			'surface-2': 'hsl(var(--surface-2) / <alpha-value>)',
			'text-muted': 'hsl(var(--text-muted) / <alpha-value>)',
			'text-subtle': 'hsl(var(--text-subtle) / <alpha-value>)',
			'border-subtle': 'hsl(var(--border-subtle) / <alpha-value>)',
			panel: {
				DEFAULT: 'hsl(var(--panel) / <alpha-value>)',
				foreground: 'hsl(var(--panel-foreground) / <alpha-value>)',
				muted: 'hsl(var(--panel-muted) / <alpha-value>)',
				border: 'hsl(var(--panel-border) / <alpha-value>)',
				divider: 'hsl(var(--panel-divider) / <alpha-value>)',
			},
			success: {
				DEFAULT: 'hsl(var(--success) / <alpha-value>)',
				foreground: 'hsl(var(--success-on-light) / <alpha-value>)',
			},
			disabled: {
				DEFAULT: 'hsl(var(--disabled) / <alpha-value>)',
				foreground: 'hsl(var(--disabled-foreground) / <alpha-value>)',
				light: 'hsl(var(--disabled-light) / <alpha-value>)',
				'light-foreground': 'hsl(var(--disabled-light-foreground) / <alpha-value>)',
			},
			'primary-hover': 'hsl(var(--primary-hover) / <alpha-value>)',
		},
  		borderRadius: {
  			lg: 'var(--radius)',
  			md: 'calc(var(--radius) - 2px)',
  			sm: 'calc(var(--radius) - 4px)'
  		},
  		keyframes: {
  			'accordion-down': {
  				from: { height: '0' },
  				to: { height: 'var(--radix-accordion-content-height)' }
  			},
  			'accordion-up': {
  				from: { height: 'var(--radix-accordion-content-height)' },
  				to: { height: '0' }
  			}
  		},
  		animation: {
  			'accordion-down': 'accordion-down 0.2s ease-out',
  			'accordion-up': 'accordion-up 0.2s ease-out'
  		},
		fontFamily: {
			sans: ['Inter', 'system-ui', 'sans-serif'],
			display: ['Oswald', 'sans-serif'],
		},
		boxShadow: {
			sm: 'var(--shadow-sm)',
			DEFAULT: 'var(--shadow)',
			md: 'var(--shadow-md)',
			lg: 'var(--shadow-lg)',
			xl: 'var(--shadow-xl)',
			'2xl': 'var(--shadow-2xl)',
			card: '0 10px 30px -10px rgba(0,0,0,0.6), 0 2px 0 0 rgba(255,255,255,0.04) inset',
			cta: '0 10px 24px -8px rgba(232,103,10,0.55)',
		}
  	}
  },
  plugins: [require("tailwindcss-animate")],
} satisfies Config;
