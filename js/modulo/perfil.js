import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import { getAnalytics } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-analytics.js";
import { getDatabase, ref, onValue, set, child, get} from "https://www.gstatic.com/firebasejs/10.8.0/firebase-database.js";
import { onAuthStateChanged, signInWithPopup, GoogleAuthProvider,signOut  } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";
import { app, auth, database, provider} from "../controller/firebase.js";


//<----Pruebas con url
// Supongamos que tu ID es 123
//const id = "jShPf8NK6laRxp0TKeJsCTRdjs72";
//jShPf8NK6laRxp0TKeJsCTRdjs72
// Obtener la URL actual
//let urlActual = window.location.href;

// Agregar el ID como parámetro de la consulta
//if (urlActual.includes('?')) {
 // urlActual += `&id=${id}`;
//} else {
 // urlActual += `?id=${id}`;
//}

// Actualizar la URL actual
//window.history.pushState({ path: urlActual }, '', urlActual);
//---->




onAuthStateChanged(auth, (user) => { 
    //Variables
    var eNombre=document.getElementById('nombreUsuairo');
    var eCorreo=document.getElementById('nombreCorreo');
    var iPerfil=document.getElementById('imagenPerfil');
    var botones=document.querySelectorAll('.boton_accion');
    var refUsuarios=ref(database, 'usuarios');
    //funciones
    function ocultaAcciones() {
        botones.forEach((boton) => {
            boton.style.display = 'none';
        });
    };

    function muestraCampos(refUsuarios,urlid){
        onValue(child(refUsuarios, urlid), (snapshot) => {
            const usuarioDatos = snapshot.val();
            console.log("Nombre del usuario:", usuarioDatos);
            eNombre.innerHTML = usuarioDatos?.username;
            eCorreo.innerHTML = usuarioDatos?.email;
            iPerfil.src = usuarioDatos?.profile_picture;
          });
          botones.forEach((boton) => {
            boton.style.display='inline';
        });
    };



    //pruebas
    var url_perfil= new URLSearchParams(window.location.search);
    // Obtener el valor del parámetro 'id'
    const urlid = url_perfil.get('id');
    
    //Ejecutable
    if (user) {
        //console.log(location.pathname);
        //consulta usuarios
        if (user.uid==urlid) {
            if(location.pathname.includes("/perfil.html")){
                muestraCampos(refUsuarios,urlid);
            }
        }else{
            if(location.pathname.includes("/perfil.html")){
                muestraCampos(refUsuarios,urlid);
                ocultaAcciones();
            }
 
        }
    }else{
        if (location.pathname.includes("/perfil.html") || location.pathname.includes("/index.html")){
            muestraCampos(refUsuarios,urlid);
            ocultaAcciones();   
        }
    }
})

