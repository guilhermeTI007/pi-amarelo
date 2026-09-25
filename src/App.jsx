import Batalha  from "./paginas/Batalha"
import Cadastro from "./paginas/Cadastro";
import Login from "./paginas/Login";
import Perfil from "./paginas/Perfil"
import Universos from "./paginas/Universos";
import {BrowserRouter,  Route, Routes} from "react-router-dom"
import Telainicial from "./paginas/Telainicial";


function App() {
  return ( 
    <div>
      
        {/* <Perfil/> */}
        {/* <Login/> */}
        {/* <Cadastro/> */}
        {/* <Universos/> */}
      
 <BrowserRouter>
        <Routes>
        <Route path="/" element={<Telainicial/>}/>
        <Route path="/" element={<Perfil/>}/>
        <Route path="/" element={<Batalha/>}/>
        <Route path="/" element={<login_Cadastro/>}/>
        <Route path="/" element={<Universos/>}/>
       
        </Routes>
      </BrowserRouter>


    </div>
   );
}

export default App;