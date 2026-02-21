import { useCallback, useRef } from "react"
import { Moon, Sun } from "lucide-react"
import { flushSync } from "react-dom"
import { cn } from "@/services/utils"

export const AnimatedThemeToggler = ({
    theme,
    toggleTheme,
    className,
    duration = 400,
    ...props
}) => {
    const buttonRef = useRef(null)
    const isDark = theme === "dark"

    const handleToggle = useCallback(async () => {
        if (!buttonRef.current) return

        // If browser doesn't support View Transitions, just toggle
        if (!document.startViewTransition) {
            toggleTheme();
            return;
        }

        await document.startViewTransition(() => {
            flushSync(() => {
                toggleTheme();
            })
        }).ready

        const { top, left, width, height } =
            buttonRef.current.getBoundingClientRect()
        const x = left + width / 2
        const y = top + height / 2
        const maxRadius = Math.hypot(
            Math.max(left, window.innerWidth - left),
            Math.max(top, window.innerHeight - top)
        )

        document.documentElement.animate(
            {
                clipPath: [
                    `circle(0px at ${x}px ${y}px)`,
                    `circle(${maxRadius}px at ${x}px ${y}px)`,
                ],
            },
            {
                duration,
                easing: "ease-in-out",
                pseudoElement: "::view-transition-new(root)",
            }
        )
    }, [toggleTheme, duration])

    return (
        <button
            ref={buttonRef}
            onClick={handleToggle}
            className={cn(
                "theme-toggle-btn",
                className
            )}
            title={isDark ? "Switch to Light Mode" : "Switch to Dark Mode"}
            style={{
                background: 'var(--bg-hover)',
                border: '1px solid var(--border)',
                borderRadius: 8,
                padding: '5px 10px',
                fontSize: 16,
                cursor: 'pointer',
                color: 'var(--text-primary)',
                transition: 'all 0.2s ease',
                display: 'flex',
                alignItems: 'center',
                gap: 6,
                ...props.style
            }}
            {...props}
        >
            {isDark ? <Sun size={16} /> : <Moon size={16} />}
            <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>
                {isDark ? 'Light' : 'Dark'}
            </span>
        </button>
    )
}
