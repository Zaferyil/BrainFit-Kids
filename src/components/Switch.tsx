type Props = { checked: boolean; onChange: (checked: boolean) => void; label: string; small?: boolean }

export function Switch({ checked, onChange, label, small }: Props) {
  return (
    <button
      type="button" role="switch" aria-checked={checked} aria-label={label}
      className={small ? 'switch sm' : 'switch'} onClick={() => onChange(!checked)}
    />
  )
}
