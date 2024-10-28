// tailwind.config.js
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}", // <-- Add this line to scan all your component files
    './node_modules/shadcn/ui/**/*.{js,ts,jsx,tsx}',  // Add this line
  ],
  theme: {
    extend: {},
  },
  plugins: [],
}
