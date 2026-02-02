/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // 라이트 모드 (작가님 픽)
        paper: '#FDFBF7',
        ink: '#333333',
        'primary-accent': '#8B5CF6',
        
        // 다크 모드 (네온 미드나잇 제안)
        midnight: '#0F172A',      // 깊은 네이비 블랙
        'pale-lavender': '#F1F5F9', // 부드러운 화이트
        'dark-accent': '#C084FC',   // 형광 느낌의 밝은 보라
        'forest-sub': '#1E293B',    // 카드/UI 요소용 짙은 회색
      }
    },
  },
  plugins: [
    require('@tailwindcss/typography'),
  ],
}