import { useState } from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'

import Login from './components/Login.jsx'
import Navbar from './components/Navbar.jsx'
import ListaProyectos from './components/ListaProyectos.jsx'
import CrearProyecto from './components/CrearProyecto.jsx'
import CrearTarea from './components/CrearTarea.jsx'

// URL base del backend de Spring Boot
export const API = 'http://localhost:8080'

// Lee la sesion guardada en localStorage (sobrevive al F5)
function leerSesion() {
  return {
    token: localStorage.getItem('token'),
    rol: localStorage.getItem('rol'),
    username: localStorage.getItem('username'),
  }
}

function App() {
  // Estado global de sesion, inicia leyendo el localStorage
  const [sesion, setSesion] = useState(leerSesion)

  // Guarda token + rol + username en localStorage (lo llama Login)
  const iniciarSesion = (datos) => {
    localStorage.setItem('token', datos.token)
    localStorage.setItem('rol', datos.rol)
    localStorage.setItem('username', datos.username)
    setSesion(leerSesion())
  }

  // LOGOUT: 1) avisa al backend con el Bearer token, 2) limpia localStorage,
  // 3) al quedar sin token, las rutas redirigen solas al login
  const cerrarSesion = async () => {
    try {
      await fetch(`${API}/api/auth/logout`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${sesion.token}` },
      })
    } catch (error) {
      console.error('Error al notificar el logout:', error)
    } finally {
      localStorage.clear()
      setSesion(leerSesion())
    }
  }

  const autenticado = Boolean(sesion.token)
  const esAdmin = sesion.rol === 'ADMIN'

  return (
    <div className="app">
      {/* El Navbar solo aparece con sesion activa */}
      {autenticado && <Navbar sesion={sesion} onLogout={cerrarSesion} />}

      <main className="contenido">
        <Routes>
          {/* Si ya esta logueado, /login lo manda a los proyectos */}
          <Route
            path="/login"
            element={
              autenticado
                ? <Navigate to="/proyectos" replace />
                : <Login onLogin={iniciarSesion} />
            }
          />

          {/* Ruta protegida: sin token redirige al login */}
          <Route
            path="/proyectos"
            element={
              autenticado
                ? <ListaProyectos token={sesion.token} />
                : <Navigate to="/login" replace />
            }
          />

          {/* Solo ADMIN */}
          <Route
            path="/gestionar"
            element={
              autenticado && esAdmin
                ? <CrearProyecto token={sesion.token} />
                : <Navigate to={autenticado ? '/proyectos' : '/login'} replace />
            }
          />

          {/* Solo ADMIN */}
          <Route
            path="/crear-tarea"
            element={
              autenticado && esAdmin
                ? <CrearTarea token={sesion.token} />
                : <Navigate to={autenticado ? '/proyectos' : '/login'} replace />
            }
          />

          {/* Cualquier otra URL */}
          <Route
            path="*"
            element={<Navigate to={autenticado ? '/proyectos' : '/login'} replace />}
          />
        </Routes>
      </main>
    </div>
  )
}

export default App