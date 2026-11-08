/** Rechenaufgabe untereinander wie im Buch: oben a, darunter „−b“ bzw. „+b“ und ein Strich */
export function Senkrecht({ a, b, className = '' }: { a: number; b: number; className?: string }) {
  return (
    <span className={`senkrecht ${className}`} aria-label={`${a} ${b < 0 ? 'minus' : 'plus'} ${Math.abs(b)}`}>
      <span>{a}</span>
      <span className="op">{b < 0 ? '−' : '+'}{Math.abs(b)}</span>
    </span>
  )
}

/** Text wie „12 − 9“ untereinander zeigen; anderer Text bleibt, wie er ist */
export function AufgabeText({ text }: { text: string }) {
  const m = /^(\d+) ([+−-]) (\d+)$/.exec(text.trim())
  return m ? <Senkrecht a={Number(m[1])} b={(m[2] === '+' ? 1 : -1) * Number(m[3])} /> : <>{text}</>
}
