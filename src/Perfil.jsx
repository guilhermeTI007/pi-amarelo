import "./Perfil.css";

function Perfil() {
  return ( 
    <div>
      <nav className="navbar">
        <div className="nav-left">
          <button className="menu-btn">☰</button>
          <input type="text" className="search-bar" placeholder="🔍 Buscar..."/>
        </div>
        <div className="nav-center">
          <a href="#" className="nav-link">INICIAL</a>
          <span className="nav-link">•</span>
          <a href="#" className="nav-link">PERSONAGENS</a>
          <span className="nav-link">•</span>
          <a href="#" className="nav-link">COMUNIDADE</a>
        </div>
        <div className="nav-right">
          <a href="#" className="nav-link">CADASTRAR</a>
          <span className="nav-link">•</span>
          <a href="#" className="nav-link">ENTRAR</a>
          <div className="user-icon">👤</div>
        </div>
      </nav>

      <div className="container">
        {/* CORRIGIDO: Style inline convertido para objeto */}
        <div style={{ marginBottom: '20px', textAlign: 'center' }}>
          {/* CORRIGIDO: Style inline convertido para objeto */}
          <label style={{ cursor: 'pointer', fontSize: '12px', color: '#ccc' }}>
            <input type="checkbox" id="premium-toggle"/> (Demo: Marcar para simular plano assinado)
          </label>
        </div>

        <div className="profile-section">
          <div className="profile-card">
            <div className="banner-area"></div>
            <button className="settings-btn">⚙️</button>
            
            <a href="PLANOS.html" className="btn-planos">Planos</a>
            
            <div className="profile-pic-container">
              <img src="https://placehold.co/120x120/FFF/000?text=User" alt="Foto de Perfil" className="profile-pic"/>
              <div className="premium-stars"></div>
            </div>

            <input type="checkbox" id="title-modal-toggle"/>
            
            {/* CORRIGIDO: "for" alterado para "htmlFor" */}
            <label htmlFor="title-modal-toggle" className="profile-title-trigger">
              "Olhos de lince"
            </label>

            <div className="modal-overlay">
              {/* CORRIGIDO: "for" alterado para "htmlFor" */}
              <label htmlFor="title-modal-toggle" className="close-modal-area"></label>
              <div className="modal-content">
                <div className="modal-header">
                  <input type="text" className="modal-search" placeholder="🔍 Pesquisar títulos..."/>
                </div>
                <div className="modal-body">
                  <div className="title-option">"Olhos de lince"</div>
                  <div className="title-option">"Votador Voraz"</div>
                  <div className="title-option">"Amável"</div>
                  <div className="title-option">"Pequeno Padawan"</div>
                  <div className="title-option">"O Hater"</div>
                  <div className="title-option">"Gotham precisa de você"</div>
                  <div className="title-option">"Mestre Jedi"</div>
                  <div className="title-option">"Lobo Solitário"</div>
                  <div className="title-option">"Caçador de Bugs"</div>
                  <div className="title-option">"Sábio Ancestral"</div>
                  <div className="title-option">"Novato"</div>
                  <div className="title-option">"Veterano"</div>
                  <div className="title-option">"Explorador"</div>
                  <div className="title-option">"Herói Local"</div>
                  <div className="title-option">"Lenda Viva"</div>
                  <div className="title-option">"Colecionador"</div>
                  <div className="title-option">"Crítico"</div>
                  <div className="title-option">"Apoiador"</div>
                  <div className="title-option">"Veloz"</div>
                  <div className="title-option">"Ninja"</div>
                </div>
              </div>
            </div>

            <div className="stats-container">
              <div className="stat-box">
                <span>Curtidas</span>
                <strong>10</strong>
              </div>
              <div className="stat-box">
                <span>Seguidores</span>
                <strong>10</strong>
              </div>
            </div>
          </div>

          <div className="bio-card">
            <h3>BIOGRAFIA:</h3>
            <div className="bio-content"></div>
          </div>
        </div>

        <div className="activities-section">
          <div className="activities-title">ATIVIDADES RECENTES</div>
          
          <div className="activity-item">
            <div style={{ position: 'absolute', marginLeft: '-5px', marginTop: '-15px', color: 'white' }}>⭐</div>
            <div className="activity-icon">👤</div>
            <div className="activity-text">
              De acordo com o seg.20 minutos 3 é possivel ver que pipipipopopo
            </div>
            <div className="activity-actions">
              <button className="action-btn up">👍</button>
              <button className="action-btn down">👎</button>
            </div>
          </div>

          <div className="activity-item">
            <div style={{ position: 'absolute', marginLeft: '-5px', marginTop: '-15px', color: 'white' }}>⭐</div>
            <div className="activity-icon">👤</div>
            <div className="activity-text">
              De acordo com o seg.20 minutos 3 é possivel ver que pipipipopopo
            </div>
            <div className="activity-actions">
              <button className="action-btn up">👍</button>
              <button className="action-btn down">👎</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Perfil;
