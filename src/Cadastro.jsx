import "./Login_cadastro.css"

function Cadastro() {
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

                <h1>Cadastrar    Usuário</h1>

                <span class="input-row">

                    <input class="input-row" type="text" placeholder="Nome de usuário ou E-mail" required/>
                    <input type="date" required/>
                </span>

                <input type="email" placeholder="E-mail" required/>
                <input type="password" placeholder="Senha" required/>
                <input type="password" placeholder="Confirmar senha" required/>

            </div>

            <span class="input-row">

                <button class="btn">CONTINUAR</button>
                <button class="btn">Já tenho uma conta?</button>

            </span>

        </form>

    </div>




    </div>
   );
}

export default Cadastro;