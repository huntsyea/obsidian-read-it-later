export default {
    darkMode: ["class"],
    content: ["./src/**/*.{ts,tsx}"],
	// Don't use prefix as it breaks existing styles
	corePlugins: {
		preflight: false,
	},
	theme: {
    	colors: {
    		base: {
    			'10': 'var(--color-base-10)',
    			'20': 'var(--color-base-20)',
    			'25': 'var(--color-base-25)',
    			'30': 'var(--color-base-30)',
    			'35': 'var(--color-base-35)',
    			'40': 'var(--color-base-40)',
    			'50': 'var(--color-base-50)',
    			'60': 'var(--color-base-60)',
    			'70': 'var(--color-base-70)',
    			'100': 'var(--color-base-100)',
    			'00': 'var(--color-base-00)',
    			'05': 'var(--color-base-05)'
    		},
    		red: 'var(--color-red)',
    		'red-rgb': 'rgba(var(--color-red-rgb),<alpha-value>)',
    		orange: 'var(--color-orange)',
    		'orange-rgb': 'rgba(var(--color-orange-rgb),<alpha-value>)',
    		yellow: 'var(--color-yellow)',
    		'yellow-rgb': 'rgba(var(--color-yellow-rgb),<alpha-value>)',
    		green: 'var(--color-green)',
    		'green-rgb': 'rgba(var(--color-green-rgb),<alpha-value>)',
    		cyan: 'var(--color-cyan)',
    		'cyan-rgb': 'rgba(var(--color-cyan-rgb),<alpha-value>)',
    		blue: 'var(--color-blue)',
    		'blue-rgb': 'rgba(var(--color-blue-rgb),<alpha-value>)',
    		purple: 'var(--color-purple)',
    		'purple-rgb': 'rgba(var(--color-purple-rgb),<alpha-value>)',
    		pink: 'var(--color-pink)',
    		'pink-rgb': 'rgba(var(--color-pink-rgb),<alpha-value>)',
    		gray: 'var(--color-gray)',
    		'mono-rgb': {
    			'0': 'rgba(var(--mono-rgb-0),<alpha-value>)',
    			'100': 'rgba(var(--mono-rgb-100),<alpha-value>)'
    		},
    		background: {
    			primary: 'var(--background-primary)',
    			'primary-alt': 'var(--background-primary-alt)',
    			secondary: 'var(--background-secondary)',
    			'secondary-alt': 'var(--background-secondary-alt)',
    			modifier: {
    				hover: 'var(--background-modifier-hover)',
    				'active-hover': 'var(--background-modifier-active-hover)',
    				border: 'var(--background-modifier-border)',
    				'border-hover': 'var(--background-modifier-border-hover)',
    				'border-focus': 'var(--background-modifier-border-focus)',
    				error: 'var(--background-modifier-error)',
    				'error-rgb': 'rgba(var(--background-modifier-error-rgb),<alpha-value>)',
    				'error-hover': 'var(--background-modifier-error-hover)',
    				success: 'var(--background-modifier-success)',
    				'success-rgb': 'rgba(var(--background-modifier-success-rgb),<alpha-value>)',
    				message: 'var(--background-modifier-message)',
    				'form-field': 'var(--background-form-field)'
    			}
    		},
    		interactive: {
    			normal: 'var(--interactive-normal)',
    			hover: 'var(--interactive-hover)',
    			accent: 'var(--interactive-accent)',
    			'accent-hsl': 'hsl(var(--interactive-accent-hsl),<alpha-value>)',
    			'accent-hover': 'var(--interactive-accent-hover)'
    		},
    		text: {
    			normal: 'var(--text-normal)',
    			muted: 'var(--text-muted)',
    			faint: 'var(--text-faint)',
    			'on-accent': 'var(--text-on-accent)',
    			'on-accent-inverted': 'var(--text-on-accent-inverted)',
    			success: 'var(--text-success)',
    			warning: 'var(--text-warning)',
    			error: 'var(--text-error)',
    			accent: 'var(--text-accent)',
    			'accent-hover': 'var(--text-accent-hover)',
    			selection: 'var(--text-selection)',
    			'highlight-bg': 'var(--text-highlight-bg)',
    			bold: 'var(--bold-color)',
    			italic: 'var(--italic-color)'
    		},
    		caret: 'var(--caret-color)',
    		icon: {
    			DEFAULT: 'var(--icon-color)',
    			hover: 'var(--icon-color-hover)',
    			active: 'var(--icon-color-active)',
    			focused: 'var(--icon-color-focused)'
    		}
    	},
    	borderWidth: {
    		DEFAULT: 'var(--border-width)'
    	},
    	borderRadius: {
    		'clickable-icon': 'var(--clickable-icon-radius)',
    		s: 'var(--radius-s)',
    		m: 'var(--radius-m)',
    		l: 'var(--radius-l)',
    		xl: 'var(--radius-xl)'
    	},
    	zIndex: {
    		cover: 'var(--layer-cover)',
    		sidedock: 'var(--layer-sidedock)',
    		'status-bar': 'var(--layer-status-bar)',
    		popover: 'var(--layer-popover)',
    		slides: 'var(--layer-slides)',
    		modal: 'var(--layer-modal)',
    		notice: 'var(--layer-notice)',
    		menu: 'var(--layer-menu)',
    		tooltip: 'var(--layer-tooltip)',
    		'dragged-item': 'var(--layer-dragged-item)'
    	},
    	fontSize: {
    		text: 'var(--font-text-size)',
    		smallest: 'var(--font-smallest)',
    		smaller: 'var(--font-smaller)',
    		small: 'var(--font-small)',
    		'ui-smaller': 'var(--font-ui-smaller)',
    		'ui-small': 'var(--font-ui-small)',
    		'ui-medium': 'var(--font-ui-medium)',
    		'ui-larger': 'var(--font-ui-larger)'
    	},
    	strokeWidth: {
    		icon: 'var(--icon-stroke)',
    		'icon-xs': 'var(--icon-xs-stroke-width)',
    		'icon-s': 'var(--icon-s-stroke-width)',
    		'icon-m': 'var(--icon-m-stroke-width)',
    		'icon-l': 'var(--icon-l-stroke-width)',
    		'icon-xl': 'var(--icon-xl-stroke-width)'
    	},
    	fontWeight: {
    		thin: 'var(--font-thin)',
    		extralight: 'var(--font-extralight)',
    		light: 'var(--font-light)',
    		normal: 'var(--font-normal)',
    		medium: 'var(--font-medium)',
    		semibold: 'var(--font-semibold)',
    		bold: 'var(--font-bold)',
    		extrabold: 'var(--font-extrabold)',
    		black: 'var(--font-black)'
    	},
    	lineHeight: {
    		normal: 'var(--line-height-normal)',
    		tight: 'var(--line-height-tight)'
    	},
    	extend: {
    		cursor: {
    			DEFAULT: 'var(--cursor)',
    			link: 'var(--cursor-link)'
    		},
    		size: {
    			icon: 'var(--icon-size)',
    			'icon-xs': 'var(--icon-xs)',
    			'icon-s': 'var(--icon-s)',
    			'icon-m': 'var(--icon-m)',
    			'icon-l': 'var(--icon-l)',
    			'icon-xl': 'var(--icon-xl)',
    			checkbox: 'var(--checkbox-size)'
    		},
    		opacity: {
    			icon: 'var(--icon-opacity)',
    			'icon-hover': 'var(--icon-opacity-hover)',
    			'icon-active': 'var(--icon-opacity-active)'
    		},
    		borderRadius: {
    			lg: 'var(--radius)',
    			md: 'calc(var(--radius) - 2px)',
    			sm: 'calc(var(--radius) - 4px)'
    		},
    		colors: {
    			background: 'hsl(var(--background))',
    			foreground: 'hsl(var(--foreground))',
    			card: {
    				DEFAULT: 'hsl(var(--card))',
    				foreground: 'hsl(var(--card-foreground))'
    			},
    			popover: {
    				DEFAULT: 'hsl(var(--popover))',
    				foreground: 'hsl(var(--popover-foreground))'
    			},
    			primary: {
    				DEFAULT: 'hsl(var(--primary))',
    				foreground: 'hsl(var(--primary-foreground))'
    			},
    			secondary: {
    				DEFAULT: 'hsl(var(--secondary))',
    				foreground: 'hsl(var(--secondary-foreground))'
    			},
    			muted: {
    				DEFAULT: 'hsl(var(--muted))',
    				foreground: 'hsl(var(--muted-foreground))'
    			},
    			accent: {
    				DEFAULT: 'hsl(var(--accent))',
    				foreground: 'hsl(var(--accent-foreground))'
    			},
    			destructive: {
    				DEFAULT: 'hsl(var(--destructive))',
    				foreground: 'hsl(var(--destructive-foreground))'
    			},
    			border: 'hsl(var(--border))',
    			input: 'hsl(var(--input))',
    			ring: 'hsl(var(--ring))',
    			chart: {
    				'1': 'hsl(var(--chart-1))',
    				'2': 'hsl(var(--chart-2))',
    				'3': 'hsl(var(--chart-3))',
    				'4': 'hsl(var(--chart-4))',
    				'5': 'hsl(var(--chart-5))'
    			}
    		},
    		keyframes: {
    			'accordion-down': {
    				from: {
    					height: '0'
    				},
    				to: {
    					height: 'var(--radix-accordion-content-height)'
    				}
    			},
    			'accordion-up': {
    				from: {
    					height: 'var(--radix-accordion-content-height)'
    				},
    				to: {
    					height: '0'
    				}
    			}
    		},
    		animation: {
    			'accordion-down': 'accordion-down 0.2s ease-out',
    			'accordion-up': 'accordion-up 0.2s ease-out'
    		}
    	}
    },
	plugins: [require("tailwindcss-animate")],
};
