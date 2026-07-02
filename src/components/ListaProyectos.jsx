import { useState, useEffect } from 'react'
import { API } from '../App.jsx'

// EXAMEN 2.2: tabla de proyectos con GET protegido (token en las cabeceras)
function ListaProyectos({ token }) {
  const [proyectos, setProyectos] = useState([])
  const [totalPublico, setTotalPublico] = useState(null)
  const [cargando, setCargando] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    const cargarProyectos = async () => {
      try {
        // Inyectamos el token JWT en la cabecera Authorization
        const respuesta = await fetch(`${API}/api/proyectos`, {
          method: 'GET',
          headers: { Authorization: `Bearer ${token}` },
        })

        if (respuesta.ok) {
          const datos = await respuesta.json()
          setProyectos(datos)
        } else if (respuesta.status === 401) {
          setError('Tu sesión expiró o fue cerrada. Vuelve a iniciar sesión.')
        } else {
          setError(`El servidor rechazó la petición (código ${respuesta.status}).`)
        }
      } catch {
        setError('No se pudo conectar con el servidor.')
      } finally {
        setCargando(false)
      }
    }

    // EXAMEN 1.2: consumimos el endpoint publico SIN token
    const cargarResumenPublico = async () => {
      try {
        const respuesta = await fetch(`${API}/api/proyectos/publico/resumen`)
        if (respuesta.ok) {
          setTotalPublico(await respuesta.json())
        }
      } catch {
        // metrica informativa, no critica
      }
    }

    cargarProyectos()
    cargarResumenPublico()
  }, [token])

  return (
    <section className="panel">
      <div className="panel-cabecera">
        <div>
          <h2>Catálogo de Proyectos</h2>
          <p className="panel-sub">Datos protegidos consumidos con token JWT</p>
        </div>
        {totalPublico !== null && (
          <div className="metrica">
            <span className="metrica-numero">{totalPublico}</span>
            <span className="metrica-texto">proyectos registrados<br />(métrica pública)</span>
          </div>
        )}
      </div>

      {cargando && <p className="mensaje">Cargando proyectos…</p>}
      {error && <div className="alerta alerta-error">{error}</div>}

      {!cargando && !error && (
        <div className="tabla-contenedor">
          <table className="tabla">
            <thead>
              <tr>
                <th>ID</th>
                <th>Nombre</th>
                <th>Descripción</th>
                <th>Fecha de inicio</th>
              </tr>
            </thead>
            <tbody>
              {/* .map() convierte cada proyecto en una fila de la tabla */}
              {proyectos.map((p) => (
                <tr key={p.id}>
                  <td>{p.id}</td>
                  <td className="celda-nombre">{p.nombre}</td>
                  <td>{p.descripcion}</td>
                  <td>{p.fechaInicio}</td>
                </tr>
              ))}

              {proyectos.length === 0 && (
                <tr>
                  <td colSpan="4" className="mensaje">
                    Aún no hay proyectos registrados.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </section>
  )
}

export default ListaProyectos