// Importar las bibliotecas de Firebase
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import { getAnalytics } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-analytics.js";
import { getDatabase, ref as dbRef, push, child, onValue, remove, set, orderByChild, get, equalTo, query, update } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-database.js";
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";
import { getStorage, ref as storageRef, uploadBytes, getDownloadURL } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-storage.js";
import { app, auth, database, provider, storage } from "../controller/firebase.js";
import { generateMD5Hash } from "../operedor/codificador.js";
import { consultaVarPers } from "../modulo/varPers.js";


const listap = document.getElementById('video_index');
var refPublicaciones = dbRef(database, 'publicaciones');
function obternerPubs(nombre){
    const dbRefPublicacionesI = child(refPublicaciones, `publis`);
    onValue(dbRefPublicacionesI, (snapshot) => {
        let publicaciones=[];
        // Itera sobre cada hijo de la colección de publicaciones
        snapshot.forEach((childSnapshot) => {
            // Obtén los datos de la publicación actual
            const publicacion = childSnapshot.val();
            publicacion.nombre=nombre;
            console.log(publicacion);
            if (nombre) {
                publicacion.verificar = ""
            } else {
                publicacion.verificar = "hidden";
            }
            publicaciones.push(publicacion);
        });
        publicaciones.sort((a, b) => new Date(b.fecha_subida) - new Date(a.fecha_subida));
        listap.innerHTML=``;
        listaPub(publicaciones,nombre);
    });
}

//-----------------------------------------mostrar comentrarios

async function obtenerURLVideo(archivoUrl) {
    const storage = getStorage(app);
    const videoRef = storageRef(storage, archivoUrl);
    return await getDownloadURL(videoRef);
}
async function listaPub(publi,nombre) {
    listap.innerHTML = '';
    for (const element of publi) {
        try {
            const videoUrl = await obtenerURLVideo(element.archivoUrl);
            console.log(element);
            listap.innerHTML += `
                    <div class="card publicacion">
                        <div class="card-header">
                            <h3>${element.titulo}</h3>
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
                           <div class="container">
                           <div id="toolbar" ${element.verificar}>
                           <button class="btn btn-outline-success" id="bold_${element.id_db_video}">Bold</button>
                           <button class="btn btn-outline-success" id="italic_${element.id_db_video}">Italic</button>
                           <button class="btn btn-outline-success" id="underline_${element.id_db_video}">Underline</button>
                           <button class="btn btn-outline-success" id="leftAlign_${element.id_db_video}">Izquierda</button>
                           <button class="btn btn-outline-success" id="centerAlign_${element.id_db_video}">Centro</button>
                           <button class="btn btn-outline-success" id="rightAlign_${element.id_db_video}">Derecha</button>
                           <button class="btn btn-outline-success" id="justify_${element.id_db_video}">Justificado</button>
                                <div class="input-group mb-3">
                           <input type="file" id="imagenInput_${element.id_db_video}" accept="image/*" style="display: none;">
                           <button class="btn btn-outline-success" id="adjuntarImagen_${element.id_db_video}">Adjuntar Imagen</button>
                                </div>
                            </div>
                         <div ${element.verificar}>
                         <div id="editor_${element.id_db_video}" contenteditable="true" >
                           <p>Escribe aquí...</p>
                         </div>
                         <button class="btn btn-outline-success" id="comentar_${element.id_db_video}" data-publicacion-id="${'publicaciones/publis/' + element.id_db_video + '/comentarios'}">Comentar publicación</button>
                        </div>
                        <div class="container card-body" id="coment_${element.id_db_video}">
                        </div>
                        </div>
                    </div>
                `;
            let comentss = Object.values(element.comentarios);
            let id = `coment_${element.id_db_video}`;
            comentss.sort((a, b) => new Date(b.fecha_subida) - new Date(a.fecha_subida));
            document.getElementById(id).innerHTML=''
            // Iterar sobre los comentarios en orden inverso para mostrar los más recientes primero
            for (let i = comentss.length - 1; i >= 0; i--) {
                const comentario = comentss[i];
                document.getElementById(id).innerHTML += `
        <div class="container">
            <h4>Comentado por: ${comentario.clave_usuario}</h4>
            <div>${comentario.contenido}</div>
        </div>
    `;
            }
        } catch (error) {
            console.error('Error al obtener la URL del video:', error);
            listap.innerHTML += `
                    <div class="card text-center">
                        <div class="card-body">
                        </div>
                    </div>
                `;
        }
    }
    for (const element of publi) {

        // ${'usuarios/'+element.id_director+'/profesores/'+element.id_profesor+'/grupos/'+element.id_grupo+'/publicaciones/'+element.id_db_video+'/comentarios'}
        function applyStyle(style) {
            document.execCommand(style, false);
        }

        // Manejar clic en los botones de formato
        document.getElementById('bold_' + element.id_db_video).addEventListener('click', function () {
            applyStyle('bold');
        });

        document.getElementById('italic_' + element.id_db_video).addEventListener('click', function () {
            applyStyle('italic');
        });

        document.getElementById('underline_' + element.id_db_video).addEventListener('click', function () {
            applyStyle('underline');
        });

        // Manejar clic en los botones de alineación de texto
        document.getElementById('leftAlign_' + element.id_db_video).addEventListener('click', function () {
            applyStyle('justifyLeft');
        });

        document.getElementById('centerAlign_' + element.id_db_video).addEventListener('click', function () {
            applyStyle('justifyCenter');
        });

        document.getElementById('rightAlign_' + element.id_db_video).addEventListener('click', function () {
            applyStyle('justifyRight');
        });

        document.getElementById('justify_' + element.id_db_video).addEventListener('click', function () {
            applyStyle('justifyFull');
        });

        // Manejar clic en el botón "Adjuntar Imagen"
        document.getElementById('adjuntarImagen_' + element.id_db_video).addEventListener('click', function () {
            document.getElementById('imagenInput_' + element.id_db_video).click();
        });

        // Manejar cambio en el input de imagen
        document.getElementById('imagenInput_' + element.id_db_video).addEventListener('change', function (event) {
            const imagen = event.target.files[0];
            if (imagen) {
                const reader = new FileReader();
                reader.onload = function (e) {
                    const img = document.createElement('img');
                    img.src = e.target.result;
                    document.getElementById('editor_' + element.id_db_video).appendChild(img);
                };
                reader.readAsDataURL(imagen);
            }
        });

        // Manejar clic en el botón Guardar
        document.getElementById('comentar_' + element.id_db_video).addEventListener('click', function () {
            const publicacionId = event.target.dataset.publicacionId;
            const contenido = document.getElementById('editor_' + element.id_db_video).innerHTML;
            console.log('Contenido guardado:', contenido);
            console.log('Contenido guardado:', publicacionId);
            let fecha_subida = new Date().toISOString();
            let comentario = {
                fecha_subida: fecha_subida,
                contenido: contenido,
                clave_usuario: nombre
            }
            let refCom = dbRef(database, publicacionId)
            push(refCom, comentario)
                .then((newPubRef) => {
                    //agragar ID
                    const keyPub = newPubRef.key;
                    let rutaTemp = publicacionId + "/" + keyPub;
                    let atrib = {
                        id_db_video: keyPub,
                        ruta_video: rutaTemp
                    };
                    let referenciatemp = dbRef(database, rutaTemp);
                    update(referenciatemp, atrib)
                        .then(() => {
                            console.log('Atributo agregado correctamente.');
                        })
                        .catch((error) => {
                            console.error('Error al agregar el video: ', error);
                        });
                })
                .catch((error) => {
                    console.error('Error al agregar el video: ', error);
                });
                location.reload();
        });
    }


}

//-----------------------------------------
onAuthStateChanged(auth, (user) => { 
    if (user) {
        obternerPubs(user.displayName)
    }else{
        consultaVarPers()
        .then(resultado => {
            if(resultado){
                obternerPubs(resultado.clave_usuario)
            }
        })    
        .catch(error => {
            obternerPubs();
            console.error('Error al consultar la variable personalizada:', error);
        });;
    }
});


