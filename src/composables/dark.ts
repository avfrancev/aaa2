export const isDark = useDark({ attribute: 'data-theme', valueLight: 'cupcake', valueDark: 'dracula' })
export const toggleDark = useToggle(isDark)
