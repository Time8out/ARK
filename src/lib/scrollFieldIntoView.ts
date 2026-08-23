import { useEffect } from 'react'

// Some in-app browsers (Messenger, Instagram, etc.) don't shrink the layout
// viewport when the keyboard opens the way real mobile browsers do, so a
// timer-based scrollIntoView can fire before the keyboard has finished
// animating in, or get overridden by the WebView's own panning. Instead,
// react to window.visualViewport actually changing and measure whether the
// focused field is really covered before correcting for it.
function ensureFieldVisible(el: Element) {
  const vv = window.visualViewport
  const rect = el.getBoundingClientRect()
  const visibleBottom = vv ? vv.height + vv.offsetTop : window.innerHeight
  const overlap = rect.bottom - visibleBottom
  if (overlap > 0) {
    window.scrollBy({ top: overlap + 16, behavior: 'smooth' })
  }
}

export function handleFieldFocus(e: React.FocusEvent<HTMLInputElement>) {
  const target = e.target
  setTimeout(() => ensureFieldVisible(target), 300)
}

// Mount once per auth page: keeps correcting the focused field's position
// whenever the actual visible viewport changes, for as long as it takes the
// keyboard to finish opening (rather than guessing a fixed delay).
export function useKeyboardScrollFix() {
  useEffect(() => {
    const vv = window.visualViewport
    if (!vv) return

    function handleViewportChange() {
      const active = document.activeElement
      if (active instanceof HTMLInputElement) {
        ensureFieldVisible(active)
      }
    }

    vv.addEventListener('resize', handleViewportChange)
    vv.addEventListener('scroll', handleViewportChange)
    return () => {
      vv.removeEventListener('resize', handleViewportChange)
      vv.removeEventListener('scroll', handleViewportChange)
    }
  }, [])
}
