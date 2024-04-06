  // Importar las bibliotecas de Firebase
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import { getAnalytics } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-analytics.js";
import { getDatabase, ref as dbRef, push, child, onValue, remove  } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-database.js";
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";
import { getStorage, ref as storageRef, uploadBytes, getDownloadURL } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-storage.js";
import { app, auth,  database, provider, storage } from "../controller/firebase.js";
import { generateMD5Hash } from "../operedor/codificador.js";

const listap = document.getElementById('publicaciones_list');
var refUsuarios=dbRef(database, 'usuarios');
var publicaciones = []; 
var verificar;
 
function obtenerPublicacionesDeUsuario(uid) {
var url_perfil= new URLSearchParams(window.location.search);
const urlid = url_perfil.get('id');
    const dbRefPublicaciones = child(refUsuarios, `${urlid}/publicaciones`);
    onValue(dbRefPublicaciones, (snapshot) => {
        // Itera sobre cada hijo de la colección de publicaciones
        snapshot.forEach((childSnapshot) => {
            // Obtén los datos de la publicación actual
            const publicacion = childSnapshot.val();
            publicacion.id=childSnapshot.ref._path.pieces_[3];
            publicacion.usuario=childSnapshot.ref._path.pieces_[1];
            if (childSnapshot.ref._path.pieces_[1]==uid) {
                publicacion.verificar=""
            }else{
                publicacion.verificar="hidden";
            }
            // Agrega la publicación actual a la lista de publicaciones
            publicaciones.push(publicacion);
            //Wconsole.log(publicacion);
        });
        publicaciones.sort((a, b) => new Date(b.fecha_subida) - new Date(a.fecha_subida));
        listaPub(publicaciones);
    });
}

async function obtenerURLVideo(archivoUrl) {
    const storage = getStorage(app);
    const videoRef = storageRef(storage, archivoUrl);
    return await getDownloadURL(videoRef);
}

async function listaPub(publi) {
//    console.log(publi);
    listap.innerHTML ='';
    for (const element of publi) {
        try {
            const videoUrl = await obtenerURLVideo(element.archivoUrl);
            listap.innerHTML += `
            <div class="card publicacion">
            <div class="card-header">
                <h3>${element.titulo}</h3>
                <div class="d-flex justify-content-center">
                    <button type="button" class="btn btn-outline-warning editar-btn" data-publicacion-id="${element.usuario,element.id}" ${element.verificar} hidden>Editar</button>
                    <button type="button" class="btn btn-outline-danger eliminar-btn" data-publicacion-id="${'usuarios/'+element.usuario+'/publicaciones/'+element.id}" data-publicacion-idp="${'publicaciones/publis/'+element.id}" ${element.verificar}>Eliminar</button>
                </div>
            </div>
            <div class="card-body row">
                <div class="col-md-6">
                    <div id="videoPlayer">
                        <video controls id="videoElement" class="w-100" src="${videoUrl}">
                            Tu navegador no admite la reproducción de videos.
                        </video>
                    </div>
                </div>
                <div class="col-md-6">
                    <h5>Descripción</h5>
                    <p class="card-text">${element.descripcion}</p>
                    <h5>Materiales</h5>
                    <p class="card-text">${element.materiales}</p>
                </div>
            </div>
            <div class="card-footer text-body-secondary">
                ${element.fecha_subida}
            </div>
        </div>
        
            `;
            publicaciones = [];
            
        } catch (error) {
            console.error('Error al obtener la URL del video:', error);
            listap.innerHTML += `
                <div class="card text-center">
                    <div class="card-body">
                        <p>No se encontró el video</p>
                    </div>
                </div>
            `;
        }
    }

}

function altaAcciones(uid) {
    var url_perfill= new URLSearchParams(window.location.search);
    const urlid = url_perfill.get('id');
    if (urlid==uid) {
        listap.addEventListener('click', (event) => {
            const boton = event.target;
            // Verificar si el clic fue en un botón de editar
            if (boton.classList.contains('editar-btn')) {
                const publicacionId = boton.dataset.publicacionId;
                editarPublicacion(publicacionId);
            }
        
            // Verificar si el clic fue en un botón de eliminar
            if (boton.classList.contains('eliminar-btn')) {
                const publicacionId = boton.dataset.publicacionId;
                const idpubli = boton.dataset.publicacionIdp;
                eliminarPublicacion(publicacionId,idpubli);
            }
        });
        
        // Función para editar una publicación
        async function editarPublicacion(publicacionId) {
            console.log('Editando publicación con ID:', publicacionId);
        }
        
        // Función para eliminar una publicación
        async function eliminarPublicacion(publicacionId,publi) {
            //console.log('Eliminando publicación con ID:', publicacionId);
            try {
                // Obtener referencia de la colección
                const coleccionRef = dbRef(database, publicacionId);
                const publiRef = dbRef(database, publi);
                // Eliminar la colección
                await remove(coleccionRef);
                await remove(publiRef);
                const alertaEliminacion = document.getElementById('alertaEliminacion');
                alertaEliminacion.style.display = 'block';
                //console.log(`Colección ${publicacionId} eliminada correctamente.`);
            } catch (error) {
                console.error('Error al eliminar la colección:', error);
            }
        }
    }
}

if (listap!=null) {
    onAuthStateChanged(auth, async(user) => { 
        if (user) {
            publicaciones = []; 
            obtenerPublicacionesDeUsuario(user.uid);
            altaAcciones(user.uid);
        }else{
            obtenerPublicacionesDeUsuario();
        }
    })
};