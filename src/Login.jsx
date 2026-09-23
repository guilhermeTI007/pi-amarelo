import "./Login_cadastro.css"

function Login() {
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


    <div class="card">

        <form>
            <div>

                <h1>Entrar na conta</h1>

                <input type="text" placeholder="Nome de usuário ou E-mail" required/>
                <input type="password" placeholder="Confirmar senha" required/>

            </div>

            <span class="input-row">

                <button class="btn">Continuar</button>
                <button class="btn">Criar no usuário</button>

            </span>
        </form>

    </div>


    </div>
   );
}

export default Login;