// Masthead control for OS reminders, styled as a letterpress toggle.
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
        ? 'Reminders on — tap to silence'
        : 'Get reminded before food turns'

  return (
    <button
      className={`bell ${on ? 'bell--on' : ''}`}
      onClick={onClick}
      disabled={permission === 'denied'}
      title={title}
      aria-label={title}
      aria-pressed={on}
    >
      <span className="bell__icon" aria-hidden="true">
        {on ? '🔔' : '🔕'}
      </span>
      <span className="bell__label">{on ? 'On' : 'Alerts'}</span>
    </button>
  )
}
