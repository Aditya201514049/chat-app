/** @type {import('tailwindcss').Config} */
export default {
    darkMode: ["class"],
    content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
  	extend: {
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
  		}
  	}
  },
  plugins: [require("daisyui"), require("tailwindcss-animate")],
  daisyui: {
    themes: [
      {
        chatApp: {
          "primary": "#6366f1",         // Indigo
          "primary-focus": "#4f46e5",   // Deeper indigo
          "primary-content": "#ffffff", // White text on primary
          
          "secondary": "#f59e0b",       // Amber
          "secondary-focus": "#d97706", // Deeper amber
          "secondary-content": "#ffffff", // White text on secondary
          
          "accent": "#10b981",          // Emerald
          "accent-focus": "#059669",    // Deeper emerald
          "accent-content": "#ffffff",  // White text on accent
          
          "neutral": "#374151",         // Gray-700
          "neutral-focus": "#1f2937",   // Gray-800
          "neutral-content": "#ffffff", // White text on neutral
          
          "base-100": "#f3f4f6",        // Light gray background
          "base-200": "#e5e7eb",        // Slightly darker background
          "base-300": "#d1d5db",        // Even darker background
          "base-content": "#1f2937",    // Dark text on light backgrounds
          
          "info": "#3b82f6",            // Blue
          "success": "#10b981",         // Green
          "warning": "#f59e0b",         // Yellow
          "error": "#ef4444",           // Red
          
          "--rounded-btn": "0.5rem",     // Border radius for buttons
          "--rounded-box": "0.75rem",    // Border radius for cards and other containers
        }
      },
      "light",
      "dark"
    ],
    darkTheme: "dark",
    base: true,
    styled: true,
    utils: true,
    prefix: "",
    logs: false,
  }
}

