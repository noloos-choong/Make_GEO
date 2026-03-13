import clsx from 'clsx'

interface ScoreBadgeProps {
  score: number   // 0–100
  label?: string
  size?: 'sm' | 'lg'
}

function getColor(score: number) {
  if (score >= 80) return 'bg-green-100 text-green-700'
  if (score >= 60) return 'bg-yellow-100 text-yellow-700'
  return 'bg-red-100 text-red-700'
}

export default function ScoreBadge({ score, label, size = 'sm' }: ScoreBadgeProps) {
  return (
    <span className={clsx(
      'score-badge',
      getColor(score),
      size === 'lg' && 'text-sm px-3 py-1'
    )}>
      {label && <span className="mr-1">{label}</span>}
      {score}점
    </span>
  )
}
