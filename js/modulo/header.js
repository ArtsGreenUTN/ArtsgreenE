// Importar las bibliotecas de Firebase
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import { getAnalytics } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-analytics.js";
import { getDatabase, ref, onValue, set, child, get} from "https://www.gstatic.com/firebasejs/10.8.0/firebase-database.js";
import { onAuthStateChanged, signInWithPopup, GoogleAuthProvider,signOut  } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";
import { app, auth,  database, provider} from "../controller/firebase.js";
import { generateMD5Hash } from "../operedor/codificador.js";
import { mandarDatos,consultaVarPers, modificaVarPers, agregarVarPers , limpiarVarPers} from "../modulo/login.js";

//Header del alumno
const baseLocD =`<nav class="navbar navbar-expand-lg navbar-light bg-light">
<div class="container-fluid">
  <a class="navbar-brand" href="index.html">ArtsGreen</a>
  <button class="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarNav" aria-controls="navbarNav" aria-expanded="false" aria-label="Toggle navigation">
    <span class="navbar-toggler-icon"></span>
  </button>
  <div class="collapse navbar-collapse justify-content-between" id="navbarNav">
    <div class="navbar-nav">
      <a class="nav-link" href="./grupo.html" id="grupAlum">Mi grupo</a>
    </div>
    <div class="navbar-nav">
      <!--<a class="nav-link" href="#" aria-label="Search">
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" class="mx-3" role="img" viewBox="0 0 24 24">
          <title>Search</title>
          <circle cx="10.5" cy="10.5" r="7.5"/>
          <path d="M21 21l-5.2-5.2"/>
        </svg>
      </a>-->
      <div id="foto_perfil"></div>
      <button class="btn btn-sm btn-outline-danger" id="logoutg_local">Cerrar sesión</button>
    </div>
  </div>
</div>
</nav>
`;

//Head de profesores
const baseLoc =`<nav class="navbar navbar-expand-lg navbar-light bg-light">
<div class="container-fluid">
  <!-- Título ArtsGreen -->
  <a class="navbar-brand d-lg-none" href="#">ArtsGreen</a>
  <!-- Botón de hamburguesa -->
  <button class="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarNav" aria-controls="navbarNav" aria-expanded="false" aria-label="Toggle navigation">
    <span class="navbar-toggler-icon"></span>
  </button>
  <!-- Contenido del menú -->
  <div class="collapse navbar-collapse" id="navbarNav">
    <!-- Menú izquierdo -->
    <ul class="navbar-nav me-auto mb-2 mb-lg-0">
      <li class="nav-item">
        <a class="nav-link" href="./grupos.html">Grupos</a>
      </li>
      <li class="nav-item">
        <a class="nav-link" href="./listaGrupos.html">Publicaciones Grupos</a>
      </li>
    </ul>
    <!-- Título ArtsGreen para vista de escritorio -->
    <a class="navbar-brand d-none d-lg-block mx-auto" href="#">ArtsGreen</a>
    <!-- Menú derecho -->
    <ul class="navbar-nav ms-auto mb-2 mb-lg-0">
      <!-- Ícono de perfil -->
      <li class="nav-item">
        <div id="foto_perfil"></div>
      </li>
      <!-- Botón de cerrar sesión -->
      
        <button class="btn btn-sm btn-outline-danger" id="logoutg_local">Cerrar sesión</button>
      
    </ul>
  </div>
</div>
</nav>

`;

//Head de director
const base =`<nav class="navbar navbar-expand-lg navbar-light bg-light">
<div class="container-fluid">
  <!-- Título -->
  <a class="navbar-brand" href="#">ArtsGreen</a>
  <!-- Botón para la versión móvil -->
  <button class="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarNav" aria-controls="navbarNav" aria-expanded="false" aria-label="Toggle navigation">
    <span class="navbar-toggler-icon"></span>
  </button>
  <!-- Contenido del menú -->
  <div class="collapse navbar-collapse" id="navbarNav">
    <ul class="navbar-nav me-auto">
      <li class="nav-item">
        <button type="button" class="btn btn-link nav-link" data-bs-toggle="modal" data-bs-target="#membresiasModal">Subscribirse</button>
      </li>
      <li class="nav-item">
        <a href="./listaUsuarios.html" class="nav-link">Profesores</a>
      </li>
    </ul>
    <ul class="navbar-nav ms-auto">
      <li class="nav-item">
        <a class="nav-link" href="#">
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" class="mx-3" role="img" viewBox="0 0 24 24" style="margin-top: 2px;"><title>Search</title><circle cx="10.5" cy="10.5" r="7.5"/><path d="M21 21l-5.2-5.2"/></svg>
        </a>
      </li>
      <li class="nav-item">
        <div id="foto_perfil" style="margin-right: 10px;"></div>
      </li>
      
        <button class="btn btn-sm btn-outline-danger" sytle="margin-top: 10px;" id="logoutg" onclick="cerrarSesion()">Cerrar sesión</button>
      
    </ul>
  </div>
</div>
</nav>

<div class="modal fade" id="membresiasModal" tabindex="-1" aria-labelledby="membresiasModalLabel" aria-hidden="true">
<div class="modal-dialog modal-dialog-centered">
  <div class="modal-content">
    <div class="modal-header">
      <h5 class="modal-title" id="membresiasModalLabel">Membresías</h5>
      <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
    </div>
    <div class="modal-body">
      <div class="row">
        <div class="col">
          <h5>Básica</h5>
          <p>Precio: $0 dólares</p>
          <p>Descripción: Lorem ipsum dolor sit amet, consectetur adipiscing elit.</p>
        </div>
        <div class="col">
          <h5>Premium</h5>
          <p>Precio: $5 dólares</p>
          <p>Descripción: Lorem ipsum dolor sit amet, consectetur adipiscing elit.</p>
        </div>
        <div class="col">
          <h5>Premium Plus</h5>
          <p>Precio: $10 dólares</p>
          <p>Descripción: Lorem ipsum dolor sit amet, consectetur adipiscing elit.</p>
        </div>
      </div>
    </div>
    <div class="modal-footer">
      <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cerrar</button>
    </div>
  </div>
</div>
</div>

`;

//Header del visitante/iniciar sesion
const login =`<!-- Navbar -->
<nav class="navbar navbar-expand-lg navbar-light bg-light">
  <div class="container-fluid">
    <!-- Botón para la versión móvil -->
    <button class="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarNav" aria-controls="navbarNav" aria-expanded="false" aria-label="Toggle navigation">
      <span class="navbar-toggler-icon"></span>
    </button>
    <!-- Logo -->
    <a class="navbar-brand" href="#">ArtsGreen</a>
    <!-- Contenido del menú -->
    <div class="collapse navbar-collapse justify-content-between" id="navbarNav">
      <ul class="navbar-nav me-auto mb-2 mb-lg-0">
        <li class="nav-item">
          <a class="nav-link active" aria-current="page" href="#">Inicio</a>
        </li>
        <li class="nav-item">
          <a class="nav-link" href="#" data-bs-toggle="modal" data-bs-target="#membresiasModal">Subscribirse</a>
        </li>
        <li class="nav-item">
          <a class="nav-link" href="#" data-bs-toggle="modal" data-bs-target="#login">Iniciar sesión</a>
        </li>
      </ul>
      <!-- Botón para la versión de escritorio -->
      <form class="d-flex d-lg-none">
        <a class="btn btn-outline-secondary me-2" href="#" aria-label="Search">
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" class="mx-3" role="img" viewBox="0 0 24 24"><title>Search</title><circle cx="10.5" cy="10.5" r="7.5"/><path d="M21 21l-5.2-5.2"/></svg>
        </a>
      </form>
    </div>
  </div>
</nav>

<!-- Modal Membresías -->
<div class="modal fade" id="membresiasModal" tabindex="-1" aria-labelledby="membresiasModalLabel" aria-hidden="true">
  <div class="modal-dialog modal-dialog-centered">
    <div class="modal-content">
      <div class="modal-header">
        <h5 class="modal-title" id="membresiasModalLabel">Membresías</h5>
        <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
      </div>
      <div class="modal-body">
        <div class="row">
          <div class="col">
            <h5>Básica</h5>
            <p>Precio: $0 dólares</p>
            <p>Descripción: Lorem ipsum dolor sit amet, consectetur adipiscing elit.</p>
            <button type="button" class="btn btn-primary" data-bs-toggle="modal" data-bs-target="#basicaModal">
              Membresía Básica
            </button>
          </div>
          <div class="col">
            <h5>Premium</h5>
            <p>Precio: $5 dólares</p>
            <p>Descripción: Lorem ipsum dolor sit amet, consectetur adipiscing elit.</p>
            <button type="button" class="btn btn-primary" data-bs-toggle="modal" data-bs-target="#basicaModal">
              Membresía Premium
            </button>
          </div>
          <div class="col">
            <h5>Premium Plus</h5>
            <p>Precio: $10 dólares</p>
            <p>Descripción: Lorem ipsum dolor sit amet, consectetur adipiscing elit.</p>
            <button type="button" class="btn btn-primary" data-bs-toggle="modal" data-bs-target="#basicaModal">
              Membresía Premium Plus
            </button>
          </div>
        </div>
      </div>
      <div class="modal-footer">
        <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cerrar</button>
      </div>
    </div>
  </div>
</div>

<!-- Modal Iniciar Sesión -->
<div class="modal fade" id="login" tabindex="-1" aria-labelledby="login" aria-hidden="true">
  <div class="modal-dialog">
    <div class="modal-content">
      <div class="modal-header">
        <h1 class="modal-title fs-5" id="exampleModalLabel">Inicio/Registro de cuenta</h1>
        <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
      </div>
      <div class="modal-body">
        <p>Autenticación con Google:</p>
        <button class="btn btn-warning" id="bloging">Iniciar sesión con Google</button>
        <div>
          <div class="accordion" id="accordionExample">
            <div class="accordion-item">
              <h2 class="accordion-header">
                <button class="accordion-button collapsed" type="button" data-bs-toggle="collapse" data-bs-target="#collapseOne" aria-expanded="false" aria-controls="collapseOne">
                  Alumnos y profesores
                </button>
              </h2>
              <div id="collapseOne" class="accordion-collapse collapse" data-bs-parent="#accordionExample">
                <div class="accordion-body" id="formulario_login">
                  <form id="loginAP">
                    <div class="form-group">
                      <label for="username">Usuario:</label>
                      <input type="text" class="form-control" id="usernameff" name="username" placeholder="Ingrese su usuario">
                    </div>
                    <div class="form-group">
                      <label for="password">Contraseña:</label>
                      <input type="password" class="form-control" id="passwordff" name="password" placeholder="Ingrese su contraseña">
                    </div>
                    <button type="submit" class="btn btn-primary btn-block">Iniciar Sesión</button>
                  </form>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div class="modal-footer">
        <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cerrar</button>
      </div>
    </div>
  </div>
</div>
`;

// Función para iniciar sesión con Google
function signInWithGoogle() {
  signInWithPopup(auth, provider)
    .then((result) => {
      const credential = GoogleAuthProvider.credentialFromResult(result);
      const token = credential.accessToken;
      const user = result.user;
      subirUsuario(user.email,user.displayName,user.metadata.creationTime,user.photoURL,user.reloadUserInfo.localId)

    })
    .catch((error) => {
      const errorCode = error.code;
      const errorMessage = error.message;
      const credential = GoogleAuthProvider.credentialFromError(error);
    });

};

function cerrarSesion() {
  console.log('Cerrar Sesion');
  signOut(auth).then((
  ) => { location.href="/index.html";
  }).catch((error) => {
  });
}
// Función para configurar la escucha en tiempo real en la base de datos
function configurarEscuchaEnTiempoReal(nameUser) {
  const dbRef = ref(database, "users");
  onValue(dbRef, (snapshot) => {
    const usuarios = snapshot.val();
    //alert("Se dio de alta un nuevo usuario: ", nameUser);
    //console.log(usuarios);
  });
}


 
async function subirUsuario(mail, name, fechaCreate, photo, id) {
  async function writeUserData() {
      if (await existeUsuario(id)) {
          // El usuario ya existe, realiza la lógica necesaria si es necesario
      } else {
          // El usuario no existe, realiza la operación de escritura en la base de datos
          await set(ref(database, 'usuarios/' + id), {
              username: name,
              email: mail,
              profile_picture: photo,
              fecha: fechaCreate
          });
      }
  }

  async function existeUsuario(id) {
      try {
          const snapshot = await get(ref(database, 'usuarios/' + id));
          return snapshot.exists();
      } catch (error) {
          console.error('Error al verificar si existe el usuario:', error);
          return false;
      }
  }

  await writeUserData(); // Llama a la función principal dentro de subirUsuario
}

const header = document.getElementById('header');
// Función para obtener los detalles del usuario




onAuthStateChanged(auth, (user) => {
  if (user) {
    if (user.email==='artsgreen2@gmail.com') {
      configurarEscuchaEnTiempoReal(user.displayName);
    }
    console.log("Usuario autenticado");
    header.innerHTML=base;
    console.log(user);
    let logoutg = document.getElementById('logoutg');
    let foto_perfil = document.getElementById('foto_perfil');
    foto_perfil.innerHTML=`<a href="/perfil.html?id=${user.uid}"><img style="height: 50px; width: auto;" src="${user.photoURL}"></a>`;
    logoutg.addEventListener('click', () => { 
      cerrarSesion();
    });
  } else {
    console.log("Usuario no autenticado");
    header.innerHTML=login;
    let bloging=document.getElementById('bloging');
    var myModal = new bootstrap.Modal(document.getElementById('login'));
    bloging.addEventListener('click', ()=>{
        myModal.hide();
        signInWithGoogle();
    })
    var fomlogu=document.getElementById('loginAP');
    consultaVarPers()
    .then(resultado => {
        console.log("Variable persistente encontrada:", resultado);
        header.innerHTML=baseLoc;
        if (resultado.hasOwnProperty('id_grupo')) {
          console.log("No");
          header.innerHTML=baseLocD;
          document.getElementById('grupAlum').href=`./grupo.html?id=${resultado.id_grupo}`;
        }
        let logoutg = document.getElementById('logoutg_local');
        logoutg.addEventListener('click', ()=>{
          console.log("si");
          limpiarVarPers()
          .then(resultado =>{
            location.href="/index.html";
          })
          .catch(error => {
            console.log(error);
          });
        })
    })
    .catch(error => {
        console.error("Error:", error);
    });
    if (fomlogu) {
      fomlogu.addEventListener('submit',(e)=>{
        e.preventDefault();
        let usernamef=document.getElementById('usernameff').value;
        let passwordf=document.getElementById('passwordff').value;
        mandarDatos(usernamef, passwordf)
    .then((resultado) => {
        console.log(resultado); // Aquí obtienes el resultado de la promesa
        location.reload();
    })
    .catch((error) => {
        console.error(error); // Manejar cualquier error que pueda ocurrir
    });
    })
    }
    }


});
