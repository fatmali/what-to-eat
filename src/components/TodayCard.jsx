// Prompt at the top of the fridge that nudges a daily meal log and shows the
// current streak. The whole card opens the cook-log sheet.
export function TodayCard({ streak, loggedToday, onLog }) {
  return (
    <button className={`today ${loggedToday ? 'today--done' : ''}`} onClick={onLog}>
      <span className="today__body">
        <span className="today__streak">
          {streak > 0 ? `${streak}-day streak` : 'Start a streak'}
        </span>
        <span className="today__prompt">
          {loggedToday ? "Logged today — nice." : 'What did you cook today?'}
        </span>
      </span>
      <span className="today__cta">{loggedToday ? 'Log another' : 'Log a meal'}</span>
    </button>
  )
}
