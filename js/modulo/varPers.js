// Importar las bibliotecas de Firebase
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import { getAnalytics } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-analytics.js";
import { getDatabase, ref as dbRef, push, child, onValue, remove, set, orderByChild, get, equalTo, query  } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-database.js";
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";
import { getStorage, ref as storageRef, uploadBytes, getDownloadURL } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-storage.js";
import { app, auth,  database, provider, storage } from "../controller/firebase.js";
import { generateMD5Hash } from "../operedor/codificador.js";

function consultaVarPers() {
    return new Promise((resolve, reject) => {
        var loguerPersistente = JSON.parse(localStorage.getItem('loguer'));
        if (loguerPersistente) {
            resolve(loguerPersistente); // Resuelve la promesa con los datos de la variable persistente
        } else {
            reject("No se encontró la variable persistente"); // Rechaza la promesa si no se encuentra la variable persistente
        }
    });
}
export {consultaVarPers}