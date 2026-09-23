import "./Universos.css"


function Universos() {
  return ( 
    <div>
        <header class="navbar">

   
    <button class="hamburger" id="btn-hamburger" aria-label="Menu">
      <span></span>
      <span></span>
      <span></span>
    </button>


    <div class="search-bar">

      <span class="search-icon">&#128269;</span>
      <input type="text" class="search-input" placeholder="" id="input-busca" />
    </div>


    <nav class="nav-center">
      <a href="#" class="nav-link">CADASTRAR</a>
      <span class="nav-dot">&#8226;</span>
      <a href="#" class="nav-link">PERSONAGENS</a>
      <span class="nav-dot">&#8226;</span>
      <a href="#" class="nav-link">COMUNIDADE</a>
      <span class="nav-dot">&#8226;</span>
    </nav>


    <div class="auth-area">
      <a href="#" class="auth-link" id="link-cadastrar">CADASTRAR</a>
      <span class="nav-dot">&#8226;</span>
      <a href="#" class="auth-link" id="link-entrar">ENTRAR</a>

     <img src="../imagens/icone-usuario.png" alt="Perfil do usuário" class="avatar-icon" />
      <div class="avatar-icon" aria-label="Perfil do usuário">
       
        <svg viewBox="0 0 24 24" fill="currentColor" width="22" height="22">
          <path d="M12 12c2.7 0 4.8-2.1 4.8-4.8S14.7 2.4 12 2.4 7.2 4.5 7.2 7.2 9.3 12 12 12zm0 2.4c-3.2 0-9.6 1.6-9.6 4.8v2.4h19.2v-2.4c0-3.2-6.4-4.8-9.6-4.8z"/>
        </svg>
      </div>
    </div>

  </header>
 
  <div class="main-wrapper">

    
    <aside class="sidebar" id="sidebar">
      <ul class="sidebar-list">
        <li class="sidebar-item"><a href="#" class="sidebar-link">Superheroes</a></li>
        <li class="sidebar-item active"><a href="#" class="sidebar-link">Movies</a></li>
        <li class="sidebar-item"><a href="#" class="sidebar-link">Television</a></li>
        <li class="sidebar-item"><a href="#" class="sidebar-link">Literature</a></li>
        <li class="sidebar-item"><a href="#" class="sidebar-link">Cartoons</a></li>
        <li class="sidebar-item"><a href="#" class="sidebar-link">Anime &amp; Manga</a></li>
        <li class="sidebar-item"><a href="#" class="sidebar-link">Gaming</a></li>
        <li class="sidebar-item"><a href="#" class="sidebar-link">Comics</a></li>
        <li class="sidebar-item"><a href="#" class="sidebar-link">Web comics</a></li>
        <li class="sidebar-item"><a href="#" class="sidebar-link">Theatre</a></li>
      </ul>
    </aside>
   
    <main class="content-area">

    
      <div class="universos-grid">

        
        <div class="universo-card" id="card-star-wars">
          <div class="card-image-wrap">
           
            <img src="../imagens/star-wars.jpg" alt="Star Wars" class="card-image" /> 
            <div class="card-image card-image--placeholder">
             
            </div>
          </div>
          <div class="card-info">
            <h2 class="card-title">Star Wars</h2>
            <p class="card-desc">
              Grupo: * Franquia; Categoria: Movies; 675 characters in Star Wars are available
              for you to type their personalities: Anakin Skywalker, Sheev Palpatine, Obi-Wan Kenobi...
            </p>
          </div>
        </div>
        

       
        <div class="universo-card universo-card--empty" id="card-empty-1">
         
        </div>
        
       
        <div class="universo-card" id="card-lotr">
          <div class="card-image-wrap">
           
           <img src="../imagens/lord-of-the-rings.jpg" alt="The Lord of the Rings" class="card-image" /> 
            <div class="card-image card-image--placeholder">
             
            </div>
          </div>
          <div class="card-info">
            <h2 class="card-title">The Lord of the Rings<br />(Film Trilogy)</h2>
            <p class="card-desc">
              Group: * Franchises; Category: Movies; 71 characters in The Lord of the Rings (Film
              Trilogy) are available for you to type their personalities: Gandalf the Grey, Aragorn
              Elessar
            </p>
          </div>
        </div>
        
        <div class="universo-card universo-card--empty" id="card-empty-2">
         
        </div>

        <div class="universo-card universo-card--img-only" id="card-universo-3">
          <div class="card-image-wrap card-image-wrap--full">
          
             <img src="../imagens/universo3.jpg" alt="Universo 3" class="card-image card-image--full" /> 
            <div class="card-image card-image--full card-image--placeholder">
             
            </div>
          </div>
        </div>
       
        <div class="universo-card universo-card--empty" id="card-empty-3">
          
        </div>
        
        <div class="universo-card universo-card--img-only" id="card-universo-4">
          <div class="card-image-wrap card-image-wrap--full">
          
            <img src="../imagens/universo4.jpg" alt="Universo 4" class="card-image card-image--full" /> 
            <div class="card-image card-image--full card-image--placeholder">
             
            </div>
          </div>
        </div>
       
        <div class="universo-card universo-card--empty" id="card-empty-4">
          
        </div>
       

      </div>
      

    </main>
    

  </div>
  


    </div>
   );
}

export default Universos;