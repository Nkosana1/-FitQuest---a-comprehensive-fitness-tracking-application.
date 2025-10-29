import { useContext } from 'react'
import { ThemeContext } from '../context/ThemeContext'

export const useTheme = () => {
  const context = useContext(ThemeContext)
  
  if (!context) {
    throw new Error('useTheme must be used within a ThemeContextProvider')
  }
  
  return {
    isDark: context.theme === 'dark',
    theme: context.theme,
    toggleTheme: context.toggleTheme,
    setTheme: (theme) => {
      if (theme !== context.theme) {
        context.toggleTheme()
      }
    }
  }
}