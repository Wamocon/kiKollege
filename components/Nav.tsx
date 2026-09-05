import { abschnitte } from '@/lib/abschnitte'
import { nurSichtbare } from '@/lib/freigabe'

export function Nav() {
  const sichtbare = nurSichtbare(abschnitte)
  return (
    <nav className="nav" aria-label="Abschnitte dieser Seite">
      <p className="nav-titel">Inhalt</p>
      <ol>
        {sichtbare.map((a) => (
          <li key={a.id}>
            <a href={`#${a.id}`}>
              <span className="nr">{a.nr}</span>
              <span>{a.titel}</span>
            </a>
          </li>
        ))}
      </ol>
    </nav>
  )
}
