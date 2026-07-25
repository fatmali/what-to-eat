// Header control for OS notifications. Shows the current state and lets the
// user turn expiry reminders on or off.
export function NotifyButton({ notify }) {
  const { supported, permission, enabled, requestPermission, disable } = notify

  if (!supported) return null

  const on = enabled && permission === 'granted'

  const onClick = () => {
    if (on) disable()
    else requestPermission()
  }

  const title =
    permission === 'denied'
      ? 'Notifications are blocked in your browser settings'
      : on
        ? 'Expiry reminders on — tap to turn off'
        : 'Turn on expiry reminders'

  return (
    <button
      className={`notify ${on ? 'notify--on' : ''}`}
      onClick={onClick}
      disabled={permission === 'denied'}
      title={title}
      aria-label={title}
      aria-pressed={on}
    >
      <span aria-hidden="true">{on ? '🔔' : '🔕'}</span>
    </button>
  )
}
