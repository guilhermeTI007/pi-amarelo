import "./Perfil.css"

function Planos() {
  return ( 
    <div>

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