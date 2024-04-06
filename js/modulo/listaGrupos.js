// Importar las bibliotecas de Firebase
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import { getAnalytics } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-analytics.js";
import { getDatabase, ref as dbRef, push, child, onValue, remove, set, orderByChild, get, equalTo, query, update } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-database.js";
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";
import { getStorage, ref as storageRef, uploadBytes, getDownloadURL } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-storage.js";
import { app, auth, database, provider, storage } from "../controller/firebase.js";
import { generateMD5Hash } from "../operedor/codificador.js";
import { consultaVarPers } from "../modulo/varPers.js";

var modal = `<div class="container">
<div class="container" id="">
<div class="table-responsive">
  <table class="table" >
    <thead>
        <tr>
            <th>
            Nombre
            </th>
            <th>
            Ir a grupo
            </th>
        </tr>
    </thead>
    <tbody id="tabla_gru">
    </tbody>
  </table>
</div>
</div>
`;

function mostrarGrupos(resultado) {
    const gruposRef = dbRef(database, `usuarios/${resultado.id_director}/profesores/${resultado.id_profesor}/grupos`);
    // Escuchar los cambios en los datos de los grupos
    onValue(gruposRef, (snapshot) => {
        const grupos = snapshot.val();
        const tablaGrupos = document.getElementById('tabla_gru');

        // Limpiar la tabla antes de agregar los nuevos datos
        tablaGrupos.innerHTML = '';
        if (grupos) {
            Object.keys(grupos).forEach((key) => {
                const grupo = grupos[key];
                const fila = `
                <tr>
                    <td>${grupo.nombre_grupo}</td>
                    <td>
                    <a href="/grupo.html?id=${key}">
                    <button type="button" id="${key}" class="btn btn-success boton_ir">Ir</button>
                    </a>
                    </td>
                </tr>
            `;
                tablaGrupos.innerHTML += fila;
            });
        }
    })
}



consultaVarPers()
    .then(resultado => {
        console.log("si");
        if (tabla_grupos != null) {
            if (resultado) {
                console.log(resultado);
                tabla_grupos.innerHTML += modal;
                mostrarGrupos(resultado);
            }

        }
    })
    .catch(error => {
        console.error("Error:", error);
    });