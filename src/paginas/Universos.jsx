import "./Universos.css";

function Universos() {
  return ( 
    <div>
     
      <div className="main-wrapper">

        <aside className="sidebar" id="sidebar">
          <ul className="sidebar-list">
            <li className="sidebar-item"><a href="#" className="sidebar-link">Superheroes</a></li>
            <li className="sidebar-item active"><a href="#" className="sidebar-link">Movies</a></li>
            <li className="sidebar-item"><a href="#" className="sidebar-link">Television</a></li>
            <li className="sidebar-item"><a href="#" className="sidebar-link">Literature</a></li>
            <li className="sidebar-item"><a href="#" className="sidebar-link">Cartoons</a></li>
            {/* CORRIGIDO: Removido &amp; e adicionado o caractere "&" direto */}
            <li className="sidebar-item"><a href="#" className="sidebar-link">Anime & Manga</a></li>
            <li className="sidebar-item"><a href="#" className="sidebar-link">Gaming</a></li>
            <li className="sidebar-item"><a href="#" className="sidebar-link">Comics</a></li>
            <li className="sidebar-item"><a href="#" className="sidebar-link">Web comics</a></li>
            <li className="sidebar-item"><a href="#" className="sidebar-link">Theatre</a></li>
          </ul>
        </aside>
       
        <main className="content-area">

          <div className="universos-grid">

            <div className="universo-card" id="card-star-wars">
              <div className="card-image-wrap">
                <img src="../imagens/star-wars.jpg" alt="Star Wars" className="card-image" /> 
                <div className="card-image card-image--placeholder"></div>
              </div>
              <div className="card-info">
                <h2 className="card-title">Star Wars</h2>
                <p className="card-desc">
                  Grupo: * Franquia; Categoria: Movies; 675 characters in Star Wars are available
                  for you to type their personalities: Anakin Skywalker, Sheev Palpatine, Obi-Wan Kenobi...
                </p>
              </div>
            </div>

            <div className="universo-card universo-card--empty" id="card-empty-1"></div>
            
            <div className="universo-card" id="card-lotr">
              <div className="card-image-wrap">
                <img src="../imagens/lord-of-the-rings.jpg" alt="The Lord of the Rings" className="card-image" /> 
                <div className="card-image card-image--placeholder"></div>
              </div>
              <div className="card-info">
                {/* CORRIGIDO: <br /> fechado corretamente no formato JSX */}
                <h2 className="card-title">The Lord of the Rings<br />(Film Trilogy)</h2>
                <p className="card-desc">
                  Group: * Franchises; Category: Movies; 71 characters in The Lord of the Rings (Film
                  Trilogy) are available for you to type their personalities: Gandalf the Grey, Aragorn
                  Elessar
                </p>
              </div>
            </div>
            
            <div className="universo-card universo-card--empty" id="card-empty-2"></div>

            <div className="universo-card universo-card--img-only" id="card-universo-3">
              <div className="card-image-wrap card-image-wrap--full">
                <img src="../imagens/universo3.jpg" alt="Universo 3" className="card-image card-image--full" /> 
                <div className="card-image card-image--full card-image--placeholder"></div>
              </div>
            </div>
           
            <div className="universo-card universo-card--empty" id="card-empty-3"></div>
            
            <div className="universo-card universo-card--img-only" id="card-universo-4">
              <div className="card-image-wrap card-image-wrap--full">
                <img src="../imagens/universo4.jpg" alt="Universo 4" className="card-image card-image--full" /> 
                <div className="card-image card-image--full card-image--placeholder"></div>
              </div>
            </div>
           
            <div className="universo-card universo-card--empty" id="card-empty-4"></div>

          </div>

        </main>

      </div>
    </div>
  );
}

export default Universos;
