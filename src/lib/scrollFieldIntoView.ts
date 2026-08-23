import { useEffect } from 'react'

const SPACER_CLASS = 'keyboard-spacer'

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
  } else {
    el.scrollIntoView({ behavior: 'smooth', block: 'center' })
  }
}

export function handleFieldFocus(e: React.FocusEvent<HTMLInputElement>) {
  const target = e.target
  // Some WebViews never report a shrunk viewport at all (their keyboard-avoid
  // behavior is a native, JS-invisible pan), so there may be nowhere for a
  // scroll correction to move *to* if the page is already exactly one screen
  // tall. This spacer guarantees real scroll room exists underneath the form
  // while a field is focused, regardless of whether that signal ever fires.
  target.closest('.auth-content')?.classList.add(SPACER_CLASS)
  setTimeout(() => ensureFieldVisible(target), 300)
}

export function handleFieldBlur(e: React.FocusEvent<HTMLInputElement>) {
  const content = e.target.closest('.auth-content')
  setTimeout(() => {
    if (!content?.contains(document.activeElement)) {
      content?.classList.remove(SPACER_CLASS)
    }
  }, 150)
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
