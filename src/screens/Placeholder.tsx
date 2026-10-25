import { Icon } from '../components/Icon'
import { Perli } from '../components/Perli'
import { Stage } from '../components/Stage'

export function Placeholder({ title, back = { href: '#/', label: 'Zum Start' } }: { title: string; back?: { href: string; label: string } }) {
  return (
    <Stage>
      <div className="placeholder">
        <Perli mood="think" size={200} />
        <h1>{title}</h1>
        <p>Dieser Bildschirm kommt bald.</p>
        <a href={back.href} className="btn-primary small">
          <Icon name="left" size={26} color="#231A4F" strokeWidth={3} />
          {back.label}
        </a>
      </div>
    </Stage>
  )
}
