import React, { useState, useEffect } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import './NavBar.css';

export default function NavBar() {
  const navigate = useNavigate();
  const [usuarioLogado, setUsuarioLogado] = useState(null);

  useEffect(() => {
    function checarUsuario() {
      const userStr = localStorage.getItem('usuario_logado');
      if (userStr) {
        try {
          const parsed = JSON.parse(userStr);
          setUsuarioLogado(Array.isArray(parsed) ? parsed[0] : parsed);
        } catch {
          setUsuarioLogado(null);
        }
      } else {
        setUsuarioLogado(null);
      }
    }

    checarUsuario();
    window.addEventListener('storage', checarUsuario);
    return () => window.removeEventListener('storage', checarUsuario);
  }, []);

  function handleLogout() {
    localStorage.removeItem('usuario_logado');
    setUsuarioLogado(null);
    navigate('/');
  }

  return (
    <header className="navbar">
      <div className="nav-left">
        <NavLink to="/" className="nav-logo" title="Início">
          <span className="nav-logo-icon">⚔</span>
          <span className="nav-logo-text">ARENA</span>
        </NavLink>
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
        {usuarioLogado ? (
          <div className="nav-user-box">
            <button
              className="nav-link nav-link-btn nav-user-nome"
              onClick={() => navigate('/perfil')}
              type="button"
              title="Meu Perfil"
            >
              👤 {usuarioLogado.nome || 'Meu Perfil'}
            </button>
            <span className="nav-sep">•</span>
            <button
              className="nav-link nav-link-btn btn-logout"
              onClick={handleLogout}
              type="button"
              title="Sair da conta"
            >
              SAIR
            </button>
          </div>
        ) : (
          <>
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
            <div 
              className="user-icon" 
              aria-hidden="true" 
              onClick={() => navigate('/login')}
              title="Entrar"
            >
              👤
            </div>
          </>
        )}
      </div>
    </header>
  );
}
