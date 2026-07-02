import { useState } from 'react'
import { API } from '../App.jsx'

// EXAMEN 2.2: formulario solo ADMIN. Si un USER fuerza el acceso,
// capturamos el 403 del backend y mostramos la alerta
function CrearProyecto({ token }) {
  const [formulario, setFormulario] = useState({
    nombre: '',
    descripcion: '',
    fechaInicio: '',
  })

  const [mensajeExito, setMensajeExito] = useState('')
  const [mensajeError, setMensajeError] = useState('')
  const [cargando, setCargando] = useState(false)

  // Un solo manejador para todos los inputs (usa el atributo name)
  const manejarCambio = (evento) => {
    const { name, value } = evento.target
    setFormulario({ ...formulario, [name]: value })
  }

  const manejarSubmit = async (evento) => {
    evento.preventDefault()
    setMensajeExito('')
    setMensajeError('')
    setCargando(true)

    try {
      const respuesta = await fetch(`${API}/api/proyectos`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`, // token JWT en la cabecera
        },
        body: JSON.stringify(formulario),
      })

      if (respuesta.status === 201) {
        setMensajeExito(`Proyecto "${formulario.nombre}" registrado con éxito.`)
        setFormulario({ nombre: '', descripcion: '', fechaInicio: '' })

      } else if (respuesta.status === 403) {
        // Captura del error de seguridad: el rol no es ADMIN
        setMensajeError(
          'Acceso denegado (403): tu rol no tiene permisos para registrar proyectos. ' +
          'Esta acción es exclusiva de administradores.'
        )
      } else {
        setMensajeError(`No se pudo registrar el proyecto (código ${respuesta.status}).`)
      }
    } catch {
      setMensajeError('No se pudo conectar con el servidor.')
    } finally {
      setCargando(false)
    }
  }

  return (
    <section className="panel panel-angosto">
      <h2>Gestionar Proyectos</h2>
      <p className="panel-sub">Registro exclusivo para administradores</p>

      <form className="formulario" onSubmit={manejarSubmit}>
        <label htmlFor="nombre">Nombre del proyecto</label>
        <input
          id="nombre"
          name="nombre"
          type="text"
          value={formulario.nombre}
          onChange={manejarCambio}
          placeholder="Ej: Sistema de Inventario"
          required
        />

        <label htmlFor="descripcion">Descripción</label>
        <input
          id="descripcion"
          name="descripcion"
          type="text"
          value={formulario.descripcion}
          onChange={manejarCambio}
          placeholder="Breve descripción del proyecto"
        />

        <label htmlFor="fechaInicio">Fecha de inicio</label>
        {/* type="date" entrega "YYYY-MM-DD", el formato de LocalDate */}
        <input
          id="fechaInicio"
          name="fechaInicio"
          type="date"
          value={formulario.fechaInicio}
          onChange={manejarCambio}
          required
        />

        {mensajeExito && <div className="alerta alerta-exito">{mensajeExito}</div>}
        {mensajeError && <div className="alerta alerta-error">{mensajeError}</div>}

        <button type="submit" disabled={cargando}>
          {cargando ? 'Registrando…' : 'Registrar proyecto'}
        </button>
      </form>
    </section>
  )
}

export default CrearProyecto