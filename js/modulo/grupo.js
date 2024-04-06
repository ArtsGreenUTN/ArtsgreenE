// Importar las bibliotecas de Firebase
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import { getAnalytics } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-analytics.js";
import { getDatabase, ref as dbRef, push, child, onValue, remove, set, orderByChild, get, equalTo, query, update } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-database.js";
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";
import { getStorage, ref as storageRef, uploadBytes, getDownloadURL } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-storage.js";
import { app, auth, database, provider, storage } from "../controller/firebase.js";
import { generateMD5Hash } from "../operedor/codificador.js";
import { consultaVarPers } from "../modulo/varPers.js";

var modal = `
<div class="row mb-2 p2">
<h4>Publicaciones</h4>
<div class="container">
  <button type="button" class="btn btn-primary boton_accion" data-bs-toggle="modal" data-bs-target="#nueva_publicacion">
      Nueva Publicación
  </button>
</div>
<div class="alert alert-success alert-dismissible fade show" role="alert" id="alertaEliminacion" style="display: none;">
Se ha eliminado con éxito.
<button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
</div>
</div>
<div class="modal fade" id="nueva_publicacion" tabindex="-1" aria-labelledby="nueva_publicacion" aria-hidden="true">
<div class="modal-dialog">
    <div class="modal-content">
        <div class="modal-header">
            <h1 class="modal-title fs-5">Nueva Publicación</h1>
            <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
        </div>
        <div class="modal-body">
            <form class="row g-6" id="subirPublicacion">
                <div class="col-md-12">
                    <label for="titulo" class="form-label">Título</label>
                    <input type="text" class="form-control" id="titulo">
                </div>
                <div class="col-md-12">
                    <label for="descripcion" class="form-label">Descripción</label>
                    <textarea class="form-control" id="descripcion" rows="3" placeholder="Introduce una descripción"></textarea>
                </div>
                <div class="col-md-12">
                    <label for="materiales" class="form-label">Materiales</label>
                    <textarea class="form-control" id="materiales" rows="3" placeholder="Introduce los materiales"></textarea>
                </div>
                <div class="input-group mb-3">
                    <label class="input-group-text" for="video">Subir video</label>
                    <input type="file" class="form-control" id="video">
                </div>
                <div class="col-12">
                    <button type="submit" class="btn btn-primary">Subir Publicación</button>
                </div>
            </form>
        </div>
        <div class="modal-footer">
            <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cerrar</button>
            <div id="spinner" style="display: none;">
              <div class="spinner-border" role="status">
                  <span class="visually-hidden">Loading...</span>
              </div>
          </div>
        </div>
    </div>
</div>
</div>`;
//----------------------------------------------------------------------------------



const listap = document.getElementById('video_grup');
var refUsuarios = dbRef(database, 'usuarios');
var publicaciones = [];
function obtenerPublicacionesDeUsuario(claveUsuario, idDirector, idProfesor, idGrupo, idAlumno) {
    const dbRefPublicacionesG = child(refUsuarios, `${idDirector}/profesores/${idProfesor}/grupos/${idGrupo}/publicaciones`);
    onValue(dbRefPublicacionesG, (snapshot) => {
        // Itera sobre cada hijo de la colección de publicaciones
        snapshot.forEach((childSnapshot) => {
            // Obtén los datos de la publicación actual
            const publicacion = childSnapshot.val();
            console.log();
            publicacion.id_profesor = idProfesor;
            publicacion.clave_usuario = claveUsuario;
            publicacion.id_director = idDirector;
            publicacion.id_grupo = idGrupo;
            if (idAlumno == undefined || idAlumno == "" || idAlumno == null) {
                publicacion.verificar = ""
            } else {
                publicacion.verificar = "hidden";
            }
            // Agrega la publicación actual a la lista de publicaciones
            publicaciones.push(publicacion);
            //Wconsole.log(publicacion);
        });
        publicaciones.sort((a, b) => new Date(b.fecha_subida) - new Date(a.fecha_subida));
        listaPub(publicaciones);
    });
};

async function obtenerURLVideo(archivoUrl) {
    const storage = getStorage(app);
    const videoRef = storageRef(storage, archivoUrl);
    return await getDownloadURL(videoRef);
}
async function listaPub(publi) {
    listap.innerHTML = '';
    for (const element of publi) {
        try {
            const videoUrl = await obtenerURLVideo(element.archivoUrl);
            console.log(element);
            listap.innerHTML += `
                    <div class="card publicacion">
                        <div class="card-header">
                            <h3>${element.titulo}</h3>
                            <div class="d-flex justify-content-center">
                                <button type="button" class="btn btn-outline-warning editar-btn" data-publicacion-id="${element.id_profesor}" ${element.verificar} hidden>Editar</button>
                                <button type="button" class="btn btn-outline-danger eliminar-btn" data-publicacion-id="${'usuarios/' + element.id_director + '/profesores/' + element.id_profesor + '/grupos/' + element.id_grupo + '/publicaciones/' + element.id_db_video}" ${element.verificar}>Eliminar</button>
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
                           <div class="container">
                           <div id="toolbar">
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
                         <div id="editor_${element.id_db_video}" contenteditable="true">
                           <p>Escribe aquí...</p>
                         </div>
                         <button class="btn btn-outline-success" id="comentar_${element.id_db_video}" data-publicacion-id="${'usuarios/' + element.id_director + '/profesores/' + element.id_profesor + '/grupos/' + element.id_grupo + '/publicaciones/' + element.id_db_video + '/comentarios'}">Comentar publicación</button>
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
                clave_usuario: element.clave_usuario
            }
            let refCom = dbRef(database, publicacionId);
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


function altaAcciones(uid) {
    listap.addEventListener('click', (event) => {
        const boton = event.target;
        if (boton.classList.contains('editar-btn')) {
            const publicacionId = boton.dataset.publicacionId;
            editarPublicacion(publicacionId);
        }

        if (boton.classList.contains('eliminar-btn')) {
            const publicacionId = boton.dataset.publicacionId;
            eliminarPublicacion(publicacionId);
        }
    });

    async function editarPublicacion(publicacionId) {
        console.log('Editando publicación con ID:', publicacionId);
    }
    async function eliminarPublicacion(publicacionId) {
        try {
            const coleccionRef = dbRef(database, publicacionId);

            await remove(coleccionRef);
            const alertaEliminacion = document.getElementById('alertaEliminacion');
            alertaEliminacion.style.display = 'block';
        } catch (error) {
            console.error('Error al eliminar la colección:', error);
        }
    }
}







//----------------------------------------------------------------------------------
consultaVarPers()
    .then(resultado => {
        console.log("si");
        if (tabla_grupos != null) {
            if (resultado) {
                console.log(resultado);
                if (resultado.hasOwnProperty('id_grupo')) {
                    console.log("no tienes permiso");
                    obtenerPublicacionesDeUsuario(resultado.clave_usuario, resultado.id_director, resultado.id_profesor, resultado.id_grupo, resultado.id_alumno);
                } else {
                    tabla_grupos.innerHTML += modal;
                    var url_grupo = new URLSearchParams(window.location.search);
                    // Obtener el valor del parámetro 'id'
                    const urlid = url_grupo.get('id');
                    const subirPublicacion = document.getElementById('subirPublicacion');
                    if (subirPublicacion != null) {

                        const enviarFormulario = async (e) => {
                            e.preventDefault();

                            // Obtener los valores del formulario
                            const titulo = document.getElementById('titulo').value;
                            const descripcion = document.getElementById('descripcion').value;
                            const materiales = document.getElementById('materiales').value;
                            const archivo = document.getElementById('video').files[0];
                            const fecha_subida = new Date().toISOString();

                            // Mostrar el spinner de carga
                            document.getElementById('spinner').classList.add('d-block');
                            try {
                                // Subir el archivo a Firebase Storage}
                                let ref = `usuarios/${resultado.id_director}/profesores/${resultado.id_profesor}/grupos/${urlid}/publicaciones`;
                                let refeS = storageRef(storage, ref);
                                await uploadBytes(refeS, archivo);

                                // Obtener la URL del archivo subido
                                const archivoUrl = await getDownloadURL(refeS);
                                let vidref = `usuarios/${resultado.id_director}/profesores/${resultado.id_profesor}/grupos/${urlid}/publicaciones`;
                                const vidRef = dbRef(database, vidref);
                                // Guardar los datos del formulario en Firebase Realtime Database
                                const dataVid = {
                                    titulo: titulo,
                                    descripcion: descripcion,
                                    materiales: materiales,
                                    fecha_subida: fecha_subida,
                                    archivoUrl: archivoUrl
                                };
                                push(vidRef, dataVid)
                                    .then((newPubRef) => {
                                        //agragar ID
                                        const keyAlumno = newPubRef.key;
                                        let rutaTemp = vidref + "/" + keyAlumno;
                                        let atrib = {
                                            id_db_video: keyAlumno,
                                            ruta_video: rutaTemp
                                        };
                                        let referenciatemp = dbRef(database, rutaTemp);
                                        update(referenciatemp, atrib)
                                            .then(() => {
                                                console.log('Atributo agregado correctamente.');
                                                location.reload();
                                            })
                                            .catch((error) => {
                                                console.error('Error al agregar el video: ', error);
                                            });
                                    })
                                    .catch((error) => {
                                        console.error('Error al agregar el video: ', error);
                                    });
                                // Ocultar el spinner de carga
                                document.getElementById('spinner').classList.remove('d-block');
                                // Reiniciar el formulario
                                subirPublicacion.reset();

                            } catch (error) {
                                console.error('Error al subir el archivo o guardar los datos:', error);
                                // Manejar el error aquí, por ejemplo, mostrando una alerta de error
                            }
                        };

                        // Agregar el evento 'submit' al formulario
                        subirPublicacion.addEventListener("submit", enviarFormulario);
                    };
                    obtenerPublicacionesDeUsuario(resultado.clave_usuario, resultado.id_director, resultado.id_profesor, urlid);
                    altaAcciones();
                }
            }
        }
    });

