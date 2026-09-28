import { NavLink, useNavigate } from 'react-router-dom';
import './NavBar.css';

export default function NavBar() {
  const navigate = useNavigate();

  return (
    <header className="navbar">
      <div className="nav-left">
        <button className="menu-btn" aria-label="Menu">☰</button>
        <input
          className="search-bar"
          type="text"
          placeholder="🔍 Buscar..."
          aria-label="Buscar"
        />
      </div>

      <nav className="nav-center">
        <NavLink
          to="/"
          end
          className={({ isActive }) => 'nav-link' + (isActive ? ' nav-link--ativo' : '')}
        >
          INICIAL
        </NavLink>
        <span className="nav-sep">•</span>
        <NavLink
          to="/personagens"
          className={({ isActive }) => 'nav-link' + (isActive ? ' nav-link--ativo' : '')}
        >
          PERSONAGENS
        </NavLink>
        <span className="nav-sep">•</span>
        <NavLink
          to="/batalhas"
          className={({ isActive }) => 'nav-link' + (isActive ? ' nav-link--ativo' : '')}
        >
          BATALHAS
        </NavLink>
        <span className="nav-sep">•</span>
        <NavLink
          to="/nova-batalha"
          className={({ isActive }) => 'nav-link' + (isActive ? ' nav-link--ativo' : '')}
        >
          + NOVA BATALHA
        </NavLink>
      </nav>

      <div className="nav-right">
        <button
          className="nav-link nav-link-btn"
          onClick={() => navigate('/cadastro')}
          type="button"
        >
          CADASTRAR
        </button>
        <span className="nav-sep">•</span>
        <button
          className="nav-link nav-link-btn"
          onClick={() => navigate('/login')}
          type="button"
        >
          ENTRAR
        </button>
        <div className="user-icon" aria-hidden="true">👤</div>
      </div>
    </header>
  );
}
