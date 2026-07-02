import { useState, useEffect } from 'react'
import { API } from '../App.jsx'

// EXAMEN 2.2 + 1.1: crea tareas con prioridad (ALTA/MEDIA/BAJA).
// Captura el 400 "Prioridad no válida" y el 403 de seguridad
function CrearTarea({ token }) {
  const [proyectos, setProyectos] = useState([])
  const [empleados, setEmpleados] = useState([])

  const [formulario, setFormulario] = useState({
    descripcion: '',
    fechaLimite: '',
    costoEstimado: '',
    prioridad: 'ALTA',
    proyectoId: '',
  })

  const [empleadosSeleccionados, setEmpleadosSeleccionados] = useState([])
  const [mensajeExito, setMensajeExito] = useState('')
  const [mensajeError, setMensajeError] = useState('')
  const [cargando, setCargando] = useState(false)

  // Carga proyectos y empleados en paralelo para poblar los selectores
  useEffect(() => {
    const cabeceras = { Authorization: `Bearer ${token}` }

    const cargarCatalogos = async () => {
      try {
        const [respProyectos, respEmpleados] = await Promise.all([
          fetch(`${API}/api/proyectos`, { headers: cabeceras }),
          fetch(`${API}/api/empleados`, { headers: cabeceras }),
        ])

        if (respProyectos.ok) setProyectos(await respProyectos.json())
        if (respEmpleados.ok) setEmpleados(await respEmpleados.json())
      } catch {
        setMensajeError('No se pudieron cargar los catálogos del servidor.')
      }
    }

    cargarCatalogos()
  }, [token])

  const manejarCambio = (evento) => {
    const { name, value } = evento.target
    setFormulario({ ...formulario, [name]: value })
  }

  // Marca/desmarca un empleado en la lista
  const alternarEmpleado = (id) => {
    setEmpleadosSeleccionados(
      empleadosSeleccionados.includes(id)
        ? empleadosSeleccionados.filter((e) => e !== id)
        : [...empleadosSeleccionados, id]
    )
  }

  const manejarSubmit = async (evento) => {
    evento.preventDefault()
    setMensajeExito('')
    setMensajeError('')

    if (formulario.proyectoId === '') {
      setMensajeError('Debes seleccionar el proyecto al que pertenece la tarea.')
      return
    }
    if (empleadosSeleccionados.length === 0) {
      setMensajeError('Debes asignar al menos un empleado a la tarea.')
      return
    }

    setCargando(true)

    // El backend espera el proyecto y los empleados como objetos con id
    const cuerpo = {
      descripcion: formulario.descripcion,
      fechaLimite: formulario.fechaLimite,
      costoEstimado: Number(formulario.costoEstimado),
      prioridad: formulario.prioridad, // nuevo campo del examen
      proyecto: { id: Number(formulario.proyectoId) },
      empleados: empleadosSeleccionados.map((id) => ({ id })),
    }

    try {
      const respuesta = await fetch(`${API}/api/tareas`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(cuerpo),
      })

      if (respuesta.status === 201) {
        setMensajeExito(`Tarea registrada con prioridad ${formulario.prioridad}.`)
        setFormulario({
          descripcion: '', fechaLimite: '', costoEstimado: '',
          prioridad: 'ALTA', proyectoId: '',
        })
        setEmpleadosSeleccionados([])

      } else if (respuesta.status === 400) {
        // El backend rechazo la prioridad: leemos {"error": "Prioridad no válida"}
        const datos = await respuesta.json()
        setMensajeError(`Error del servidor: ${datos.error}`)

      } else if (respuesta.status === 403) {
        setMensajeError('Acceso denegado (403): solo un ADMIN puede crear tareas.')
      } else {
        setMensajeError(`No se pudo registrar la tarea (código ${respuesta.status}).`)
      }
    } catch {
      setMensajeError('No se pudo conectar con el servidor.')
    } finally {
      setCargando(false)
    }
  }

  return (
    <section className="panel panel-angosto">
      <h2>Crear Tareas</h2>
      <p className="panel-sub">Las tareas requieren una prioridad válida: ALTA, MEDIA o BAJA</p>

      <form className="formulario" onSubmit={manejarSubmit}>
        <label htmlFor="descripcion">Descripción</label>
        <input
          id="descripcion"
          name="descripcion"
          type="text"
          value={formulario.descripcion}
          onChange={manejarCambio}
          placeholder="Ej: Diseñar el módulo de reportes"
          required
        />

        <div className="fila-doble">
          <div>
            <label htmlFor="fechaLimite">Fecha límite</label>
            <input
              id="fechaLimite"
              name="fechaLimite"
              type="date"
              value={formulario.fechaLimite}
              onChange={manejarCambio}
              required
            />
          </div>
          <div>
            <label htmlFor="costoEstimado">Costo estimado ($)</label>
            <input
              id="costoEstimado"
              name="costoEstimado"
              type="number"
              step="0.01"
              min="0"
              value={formulario.costoEstimado}
              onChange={manejarCambio}
              placeholder="0.00"
              required
            />
          </div>
        </div>

        <label htmlFor="prioridad">Prioridad</label>
        {/* El select solo ofrece valores validos; la validacion final es del backend */}
        <select
          id="prioridad"
          name="prioridad"
          value={formulario.prioridad}
          onChange={manejarCambio}
        >
          <option value="ALTA">ALTA</option>
          <option value="MEDIA">MEDIA</option>
          <option value="BAJA">BAJA</option>
        </select>

        <label htmlFor="proyectoId">Proyecto</label>
        <select
          id="proyectoId"
          name="proyectoId"
          value={formulario.proyectoId}
          onChange={manejarCambio}
          required
        >
          <option value="">— Selecciona un proyecto —</option>
          {proyectos.map((p) => (
            <option key={p.id} value={p.id}>
              {p.nombre}
            </option>
          ))}
        </select>

        <label>Empleados asignados</label>
        <div className="lista-empleados">
          {empleados.map((emp) => (
            <label key={emp.id} className="chip-empleado">
              <input
                type="checkbox"
                checked={empleadosSeleccionados.includes(emp.id)}
                onChange={() => alternarEmpleado(emp.id)}
              />
              {emp.nombre}
            </label>
          ))}
          {empleados.length === 0 && (
            <span className="mensaje">No hay empleados registrados.</span>
          )}
        </div>

        {mensajeExito && <div className="alerta alerta-exito">{mensajeExito}</div>}
        {mensajeError && <div className="alerta alerta-error">{mensajeError}</div>}

        <button type="submit" disabled={cargando}>
          {cargando ? 'Registrando…' : 'Registrar tarea'}
        </button>
      </form>
    </section>
  )
}

export default CrearTarea