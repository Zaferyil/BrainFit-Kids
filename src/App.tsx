import { useState } from 'react'
import { Abakus } from './components/Abakus'
import './styles.css'

export default function App() {
  const [columns, setColumns] = useState(4)
  const [value, setValue] = useState(0)
  const [key, setKey] = useState(0)

  return (
    <main>
      <header>
        <h1>BrainFit Kids</h1>
        <p>Mental-Arithmetik</p>
      </header>

      <section className="card">
        <h2>Abakus-Test</h2>
        <div className="controls">
          <label>
            Spalten:{' '}
            <select value={columns} onChange={(e) => { setColumns(Number(e.target.value)); setValue(0); setKey((k) => k + 1) }}>
              {[2, 3, 4, 5, 6, 7, 8].map((n) => <option key={n} value={n}>{n}</option>)}
            </select>
          </label>
          <button onClick={() => { setValue(0); setKey((k) => k + 1) }}>Zurücksetzen</button>
        </div>
        <Abakus key={key} columns={columns} onChange={setValue} />
        <p className="value">Wert: <strong>{value}</strong></p>
      </section>
    </main>
  )
}
