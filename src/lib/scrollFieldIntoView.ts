// Some in-app browsers (Messenger, Instagram, etc.) don't fire the viewport
// resize events real mobile browsers use to auto-scroll a focused input above
// the on-screen keyboard, leaving it hidden behind it. Scrolling explicitly on
// focus works regardless of how well the WebView handles that.
export function handleFieldFocus(e: React.FocusEvent<HTMLInputElement>) {
  const target = e.target
  setTimeout(() => {
    target.scrollIntoView({ behavior: 'smooth', block: 'center' })
  }, 300)
}
