import "./MenuSuperior_Rodape.css"

function MenuSuperior() {
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
        </div>
     );
}

export default MenuSuperior;