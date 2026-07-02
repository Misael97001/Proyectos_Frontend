import { NavLink } from 'react-router-dom'

// EXAMEN 2.1: Navbar dinamico. USER solo ve "Ver Proyectos";
// ADMIN ademas ve "Gestionar Proyectos" y "Crear Tareas"
function Navbar({ sesion, onLogout }) {
  const esAdmin = sesion.rol === 'ADMIN'

  return (
    <header className="navbar">
      <div className="navbar-marca">
        <span className="navbar-logo">▲</span>
        <span>Tienda de Proyectos</span>
      </div>

      <nav className="navbar-enlaces">
        {/* Visible para todos los roles */}
        <NavLink to="/proyectos">Ver Proyectos</NavLink>

        {/* Renderizado condicional: si esAdmin es false, no se pintan */}
        {esAdmin && <NavLink to="/gestionar">Gestionar Proyectos</NavLink>}
        {esAdmin && <NavLink to="/crear-tarea">Crear Tareas</NavLink>}
      </nav>

      <div className="navbar-sesion">
        <span className={`rol-pildora ${esAdmin ? 'rol-admin' : 'rol-user'}`}>
          {sesion.rol}
        </span>
        <span className="navbar-usuario">{sesion.username}</span>

        {/* Boton de logout: llama a cerrarSesion de App */}
        <button className="btn-logout" onClick={onLogout}>
          Cerrar sesión
        </button>
      </div>
    </header>
  )
}

export default Navbar