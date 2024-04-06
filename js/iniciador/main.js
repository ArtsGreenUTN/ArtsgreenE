// Import the functions you need from the SDKs you need
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import { getAnalytics } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-analytics.js";
import { getDatabase, ref, onValue } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-database.js";
import { onAuthStateChanged,signInWithPopup, GoogleAuthProvider   } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";
import {app,auth,database} from "../controller/firebase.js";


//variables personalizadas
import {} from "../modulo/header.js";
import {} from "../operedor/bd.js";
import {} from "../modulo/list.js";
import {} from "../modulo/muro.js";
import {} from "../modulo/perfil.js";
import {} from "../modulo/publicaciones.js";

var session=false; 
//funcion para que firebase verifique el uso de una cuenta
onAuthStateChanged(auth, (user) => {
    if (user) {
        session=true
    } else {
        session=false
    }
}); 
export{session}