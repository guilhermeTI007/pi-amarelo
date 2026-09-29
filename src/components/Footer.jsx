import { Link } from 'react-router-dom';
import './Footer.css';

export default function Footer() {
  const ano = new Date().getFullYear();

  return (
    <footer className="footer">
      <div className="footer-inner">

        {/* Logo e tagline */}
        <div className="footer-marca">
          <span className="footer-logo">⚔ EleVenceria</span>
          <p className="footer-tagline">O campo de batalha definitivo da cultura pop</p>
        </div>

        {/* Links de navegação */}
        <nav className="footer-nav" aria-label="Links do rodapé">
          <div className="footer-col">
            <p className="footer-col-titulo">Navegar</p>
            <Link to="/" className="footer-link">Início</Link>
            <Link to="/personagens" className="footer-link">Personagens</Link>
            <Link to="/batalhas" className="footer-link">Batalhas</Link>
            <Link to="/nova-batalha" className="footer-link">Nova Batalha</Link>
          </div>
          <div className="footer-col">
            <p className="footer-col-titulo">Conta</p>
            <Link to="/login" className="footer-link">Entrar</Link>
            <Link to="/cadastro" className="footer-link">Cadastrar</Link>
            <Link to="/perfil" className="footer-link">Meu Perfil</Link>
          </div>
          <div className="footer-col">
            <p className="footer-col-titulo">Projeto</p>
            <span className="footer-link footer-link--text">Projeto Integrador</span>
            <span className="footer-link footer-link--text">SENAC — Turma Amarela</span>
            <span className="footer-link footer-link--text">React + Supabase</span>
          </div>
        </nav>
      </div>

      {/* Divisor */}
      <div className="footer-divider" />

      {/* Barra inferior */}
      <div className="footer-bottom">
        <p className="footer-copy">© {ano} EleVenceria. Projeto acadêmico — Turma Amarela.</p>
        <div className="footer-integrantes">
          <span className="footer-chip">Guilherme</span>
          <span className="footer-chip">Alex</span>
          <span className="footer-chip">Gustavo</span>
        </div>
      </div>
    </footer>
  );
}
