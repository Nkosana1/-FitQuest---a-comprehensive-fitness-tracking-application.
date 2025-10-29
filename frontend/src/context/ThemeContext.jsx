import { createContext, useContext, useReducer, useEffect } from 'react'

// Initial state
const initialState = {
  theme: localStorage.getItem('theme') || 'light',
  systemTheme: window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
}

// Action types
const ThemeActionTypes = {
  SET_THEME: 'SET_THEME',
  SET_SYSTEM_THEME: 'SET_SYSTEM_THEME',
  TOGGLE_THEME: 'TOGGLE_THEME'
}

// Reducer
const themeReducer = (state, action) => {
  switch (action.type) {
    case ThemeActionTypes.SET_THEME:
      return {
        ...state,
        theme: action.payload
      }
    
    case ThemeActionTypes.SET_SYSTEM_THEME:
      return {
        ...state,
        systemTheme: action.payload
      }
    
    case ThemeActionTypes.TOGGLE_THEME:
      return {
        ...state,
        theme: state.theme === 'light' ? 'dark' : 'light'
      }
    
    default:
      return state
  }
}

// Create context
const ThemeContext = createContext()

// ThemeProvider component
export const ThemeProvider = ({ children }) => {
  const [state, dispatch] = useReducer(themeReducer, initialState)

  // Apply theme to document
  useEffect(() => {
    const root = window.document.documentElement
    const isDark = state.theme === 'dark'
    
    if (isDark) {
      root.classList.add('dark')
    } else {
      root.classList.remove('dark')
    }
    
    localStorage.setItem('theme', state.theme)
  }, [state.theme])

  // Listen for system theme changes
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
    
    const handleChange = (e) => {
      dispatch({
        type: ThemeActionTypes.SET_SYSTEM_THEME,
        payload: e.matches ? 'dark' : 'light'
      })
    }
    
    mediaQuery.addEventListener('change', handleChange)
    
    return () => mediaQuery.removeEventListener('change', handleChange)
  }, [])

  // Set theme
  const setTheme = (theme) => {
    dispatch({ type: ThemeActionTypes.SET_THEME, payload: theme })
  }

  // Toggle theme
  const toggleTheme = () => {
    dispatch({ type: ThemeActionTypes.TOGGLE_THEME })
  }

  // Get effective theme (considering system preference)
  const getEffectiveTheme = () => {
    if (state.theme === 'system') {
      return state.systemTheme
    }
    return state.theme
  }

  // Context value
  const value = {
    theme: state.theme,
    systemTheme: state.systemTheme,
    effectiveTheme: getEffectiveTheme(),
    setTheme,
    toggleTheme,
    isDark: getEffectiveTheme() === 'dark'
  }

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  )
}

// Custom hook to use theme context
export const useTheme = () => {
  const context = useContext(ThemeContext)
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider')
  }
  return context
}

export default ThemeContext
