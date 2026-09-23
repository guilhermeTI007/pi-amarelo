import "./Perfil.css"

function Perfil() {
  return ( 
    <div>
       <nav class="navbar">
        <div class="nav-left">
            <button class="menu-btn">☰</button>
            <input type="text" class="search-bar" placeholder="🔍 Buscar..."/>
        </div>
        <div class="nav-center">
            <a href="#" class="nav-link">INICIAL</a>
            <span class="nav-link">•</span>
            <a href="#" class="nav-link">PERSONAGENS</a>
            <span class="nav-link">•</span>
            <a href="#" class="nav-link">COMUNIDADE</a>
        </div>
        <div class="nav-right">
            <a href="#" class="nav-link">CADASTRAR</a>
            <span class="nav-link">•</span>
            <a href="#" class="nav-link">ENTRAR</a>
            <div class="user-icon">👤</div>
        </div>
    </nav>

    <div class="container">
        
        <div style="margin-bottom: 20px; text-align: center;">
            <label style="cursor: pointer; font-size: 12px; color: #ccc;">
                <input type="checkbox" id="premium-toggle"/> (Demo: Marcar para simular plano assinado)
            </label>
        </div>

        <div class="profile-section">
            
            <div class="profile-card">
                <div class="banner-area"></div>
                <button class="settings-btn">⚙️</button>
                
                <a href="PLANOS.html" class="btn-planos">Planos</a>
                
                <div class="profile-pic-container">
                    <img src="https://placehold.co/120x120/FFF/000?text=User" alt="Foto de Perfil" class="profile-pic"/>
                    <div class="premium-stars"></div>
                </div>

                
                <input type="checkbox" id="title-modal-toggle"/>
                
                <label for="title-modal-toggle" class="profile-title-trigger">
                    "Olhos de lince"
                </label>

                
                <div class="modal-overlay">
                    <label for="title-modal-toggle" class="close-modal-area"></label>
                    <div class="modal-content">
                        <div class="modal-header">
                            <input type="text" class="modal-search" placeholder="🔍 Pesquisar títulos..."/>
                        </div>
                        <div class="modal-body">
                            <div class="title-option">"Olhos de lince"</div>
                            <div class="title-option">"Votador Voraz"</div>
                            <div class="title-option">"Amável"</div>
                            <div class="title-option">"Pequeno Padawan"</div>
                            <div class="title-option">"O Hater"</div>
                            <div class="title-option">"Gotham precisa de você"</div>
                            <div class="title-option">"Mestre Jedi"</div>
                            <div class="title-option">"Lobo Solitário"</div>
                            <div class="title-option">"Caçador de Bugs"</div>
                            <div class="title-option">"Sábio Ancestral"</div>
                            <div class="title-option">"Novato"</div>
                            <div class="title-option">"Veterano"</div>
                            <div class="title-option">"Explorador"</div>
                            <div class="title-option">"Herói Local"</div>
                            <div class="title-option">"Lenda Viva"</div>
                            <div class="title-option">"Colecionador"</div>
                            <div class="title-option">"Crítico"</div>
                            <div class="title-option">"Apoiador"</div>
                            <div class="title-option">"Veloz"</div>
                            <div class="title-option">"Ninja"</div>
                        </div>
                    </div>
                </div>

                <div class="stats-container">
                    <div class="stat-box">
                        <span>Curtidas</span>
                        <strong>10</strong>
                    </div>
                    <div class="stat-box">
                        <span>Seguidores</span>
                        <strong>10</strong>
                    </div>
                </div>
            </div>

            <div class="bio-card">
                <h3>BIOGRAFIA:</h3>
                <div class="bio-content">
                    
                </div>
            </div>

        </div>

        <div class="activities-section">
            <div class="activities-title">ATIVIDADES RECENTES</div>
            
            <div class="activity-item">
                <div style="position:absolute; margin-left:-5px; margin-top:-15px; color:white;">⭐</div>
                <div class="activity-icon">👤</div>
                <div class="activity-text">
                    De acordo com o seg.20 minutos 3 é possivel ver que pipipipopopo
                </div>
                <div class="activity-actions">
                    <button class="action-btn up">👍</button>
                    <button class="action-btn down">👎</button>
                </div>
            </div>

            <div class="activity-item">
                <div style="position:absolute; margin-left:-5px; margin-top:-15px; color:white;">⭐</div>
                <div class="activity-icon">👤</div>
                <div class="activity-text">
                    De acordo com o seg.20 minutos 3 é possivel ver que pipipipopopo
                </div>
                <div class="activity-actions">
                    <button class="action-btn up">👍</button>
                    <button class="action-btn down">👎</button>
                </div>
            </div>

        </div>

    </div>



    </div>
   );
}

export default Perfil;