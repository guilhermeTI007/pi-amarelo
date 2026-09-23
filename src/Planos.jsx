import "./Perfil.css"

function Planos() {
  return ( 
    <div>
    <nav class="navbar">
        <div class="nav-left">
            <button class="menu-btn">☰</button>
            <input type="text" class="search-bar" placeholder="🔍 Buscar..."/>
        </div>
        <div class="nav-center">
            <span class="nav-link">•</span>
            <a href="#" class="nav-link">CADASTRAR</a>
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

    <a href="PERFIL.html" class="back-btn">← Voltar</a>

    <h1 class="planos-header">NOSSOS PLANOS</h1>

    <div class="plans-container">
        
        <div class="plan-card">
            <h2 class="plan-title">GRATUITO</h2>
            <div class="plan-inner">
                <div class="plan-price">R$ 0</div>
                <ul class="plan-features">
                    <li>Acesso limitado</li>
                    <li>Personalização básica</li>
                </ul>
                <a href="PERFIL.html" class="plan-btn">OBTER</a>
            </div>
        </div>

        <div class="plan-card">
            <h2 class="plan-title">BÁSICO</h2>
            <div class="plan-inner">
                <div class="plan-price">R$ 20<span>Mensal</span></div>
                <ul class="plan-features">
                    <li>Acesso completo</li>
                    <li>Sem anúncios</li>
                </ul>
                <a href="PERFIL.html" class="plan-btn">OBTER</a>
            </div>
        </div>

        <div class="plan-card premium">
            <h2 class="plan-title">PREMIUM</h2>
            <div class="plan-inner">
                <div class="plan-price">R$ 30<span>Mensal</span></div>
                <ul class="plan-features">
                    <li>Todos os benefícios</li>
                    <li>Perfil com estrelas</li>
                    <li>Títulos exclusivos</li>
                </ul>
                <a href="PERFIL.html" class="plan-btn">OBTER</a>
            </div>
        </div>

    </div>


    </div>
   );
}

export default Planos;