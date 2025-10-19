/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'galaxy-blue': '#0b1b3b',
        'galaxy-glow': '#1e3a8a',
        'f1-red': '#dc2626',
        'f1-yellow': '#fbbf24',
        'f1-green': '#10b981',
        'f1-orange': '#f97316',
        'f1-purple': '#8b5cf6',
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'glow': 'glow 2s ease-in-out infinite alternate',
        'float': 'float 6s ease-in-out infinite',
        'spin-slow': 'spin 8s linear infinite',
      },
      keyframes: {
        glow: {
          '0%': { boxShadow: '0 0 5px #1e3a8a, 0 0 10px #1e3a8a, 0 0 15px #1e3a8a' },
          '100%': { boxShadow: '0 0 10px #1e3a8a, 0 0 20px #1e3a8a, 0 0 30px #1e3a8a' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-10px)' },
        },
      },
      backgroundImage: {
        'galaxy': 'radial-gradient(circle at 20% 50%, #1e3a8a 0%, transparent 50%), radial-gradient(circle at 80% 20%, #3b82f6 0%, transparent 50%), radial-gradient(circle at 40% 80%, #8b5cf6 0%, transparent 50%)',
        'stars': 'radial-gradient(2px 2px at 20px 30px, #eee, transparent), radial-gradient(2px 2px at 40px 70px, rgba(255,255,255,0.8), transparent), radial-gradient(1px 1px at 90px 40px, #fff, transparent), radial-gradient(1px 1px at 130px 80px, rgba(255,255,255,0.6), transparent), radial-gradient(2px 2px at 160px 30px, #fff, transparent)',
      },
    },
  },
  plugins: [],
}
