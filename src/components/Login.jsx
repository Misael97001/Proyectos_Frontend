import { useState } from 'react'
import { API } from '../App.jsx'

// EXAMEN 2.1: formulario controlado + fetch asincrono al login
function Login({ onLogin }) {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [cargando, setCargando] = useState(false)

  const manejarSubmit = async (evento) => {
    evento.preventDefault() // evita que el formulario recargue la pagina
    setError('')
    setCargando(true)

    try {
      // Peticion asincrona al backend
      const respuesta = await fetch(`${API}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      })

      if (respuesta.ok) {
        // Extraemos token y rol y los guardamos en localStorage (via App)
        const datos = await respuesta.json()
        onLogin({
          token: datos.token,
          rol: datos.rol,
          username: datos.username,
        })
      } else {
        setError('Credenciales incorrectas. Verifica tu usuario y contraseña.')
      }
    } catch {
      setError('No se pudo conectar con el servidor (¿está encendido Spring Boot?).')
    } finally {
      setCargando(false)
    }
  }

  return (
    <section className="login-panel">
      <div className="login-tarjeta">
        <span className="login-logo">▲</span>
        <h1>Tienda de Proyectos</h1>
        <p className="login-sub">Ecosistema seguro Spring Boot + React</p>

        <form onSubmit={manejarSubmit}>
          <label htmlFor="username">Usuario</label>
          {/* Input controlado: value + onChange sincronizan con el estado */}
          <input
            id="username"
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="Escribe tu usuario"
            required
          />

          <label htmlFor="password">Contraseña</label>
          <input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Escribe tu contraseña"
            required
          />

          {/* La alerta solo se renderiza si hay error */}
          {error && <div className="alerta alerta-error">{error}</div>}

          <button type="submit" disabled={cargando}>
            {cargando ? 'Verificando…' : 'Iniciar sesión'}
          </button>
        </form>
      </div>
    </section>
  )
}

export default Login