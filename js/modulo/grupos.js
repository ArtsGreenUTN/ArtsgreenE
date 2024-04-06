// Importar las bibliotecas de Firebase
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import { getAnalytics } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-analytics.js";
import { getDatabase, ref as dbRef, push, child, onValue, remove, set, orderByChild, get, equalTo, query, update } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-database.js";
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";
import { getStorage, ref as storageRef, uploadBytes, getDownloadURL } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-storage.js";
import { app, auth,  database, provider, storage } from "../controller/firebase.js";
import { generateMD5Hash } from "../operedor/codificador.js";
import { consultaVarPers } from "../modulo/varPers.js";

var modal = `<div class="container">
<button type="button" class="btn btn-warning" data-bs-toggle="modal" data-bs-target="#agregaGru">
+Agregar Grupo
</button>
</div>
<div class="modal fade" id="agregaGru" tabindex="-1" aria-labelledby="agregaGruLabel" aria-hidden="true">
  <div class="modal-dialog modal-dialog-centered">
    <div class="modal-content">
      <div class="modal-header">
        <h5 class="modal-title" id="agregaGruLabel">Agregar Grupo</h5>
        <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close" id="close"></button>
      </div>
      <div class="modal-body">
        <form id="form_subr">
        <input type="text" class="form-control" id="id_c" name="id_c" hidden>
        <input type="text" class="form-control" id="ruta" name="ruta" hidden>
          <div class="mb-3">
            <label for="nombre_grupo" class="form-label">Nombre de Grupo</label>
            <input type="text" class="form-control" id="nombre_grupo" name="nombre_grupo">
          </div>
          <button type="submit" class="btn btn-primary">Agregar Grupo</button>
          <div id="alert"></div>
        </form>
      </div>
      <div class="modal-footer">
      </div>
    </div>
  </div>
</div>
<div class="container" id="">
<div class="table-responsive">
  <table class="table" >
    <thead>
        <tr>
            <th>
            Nombre
            </th>
            <th>
            Opciones
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
var verifica = false;
function existe(nombreGrupo) {
    return new Promise((resolve, reject) => {
        const logueosRef = dbRef(database, 'grupos');

        // Obtener una instantánea de los datos en la colección "logueos"
        get(logueosRef).then((snapshot) => {
            if (snapshot.exists()) {
                let data = snapshot.val();
                if (data) {
                    let usuarioEncontrado = false;
                    Object.keys(data).forEach((key) => {
                        const usr = data[key];
                        if (usr.nombre_grupo == nombreGrupo) {
                            console.log("Usuario encontrado.");
                            usuarioEncontrado = true;
                        }
                    });
                    resolve(usuarioEncontrado);
                }
            } else {
                console.log('No hay datos disponibles en la colección "logueos".');
                resolve(false);
            }
        }).catch((error) => {
            console.error('Error al obtener los datos:', error);
            reject(error);
        });
    });
}

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
                    <button type="button" id="${key}" class="btn btn-primary boton_editar" data-bs-toggle="modal" data-bs-target="#agregaGru" >Editar</button>
                    <button type="button" id="${key}" class="btn btn-danger boton_eliminar">Eliminar</button>
                    </td>
                    <td>
                    <a href="listaAlumnos.html?id=${key}">
                    <button type="button" id="${key}" class="btn btn-success boton_ir">Ir</button>
                    </a>
                    </td>
                </tr>
            `;
                tablaGrupos.innerHTML += fila;
            });
            const botonesEditar = document.querySelectorAll('.boton_editar');
            const botonesEliminar = document.querySelectorAll('.boton_eliminar');
            botonesEditar.forEach(boton => {
                boton.addEventListener('click', (event) => {
                    event.preventDefault();
                    const idGrupo = event.target.id;
                    console.log('ID del grupo a editar:', idGrupo);
                    const grupoRef = dbRef(database, `usuarios/${resultado.id_director}/profesores/${resultado.id_profesor}/grupos/${idGrupo}`);
                    onValue(grupoRef, (snapshot) => {
                        const grupo = snapshot.val();
                        if (grupo) {
                            // El grupo fue encontrado, actualizar los campos del formulario con la información del grupo
                            document.getElementById('nombre_grupo').value = grupo.nombre_grupo;
                            document.getElementById('id_c').value = grupo.id_grupo; // Asignar el id del grupo al campo oculto id_c
                            document.getElementById('alert').innerHTML=``;
                        } else {
                            // El grupo no fue encontrado
                            console.log('Grupo no encontrado.');
                        }
                    }, (error) => {
                        // Manejar cualquier error que ocurra durante la consulta
                        console.error('Error al obtener el grupo:', error);
                    });
                });
            });
            

            botonesEliminar.forEach(boton => {
                boton.addEventListener('click', (event) => {
                    event.preventDefault();
                    const idGrupo = event.target.id;
                    console.log('ID del grupo a eliminar:', idGrupo);
                    borrarGrupe(resultado.id_director, idGrupo, resultado.id_profesor);
                });
            });
        }
    })
}
async function subirGrupe(idGrupo, rutaGrupo, nombreGrupo, clave_usuario) {
    if (idGrupo == null || idGrupo == undefined || idGrupo == "") {
        await existe(nombreGrupo)
            .then((existe) => {
                if (existe) {
                    console.log("El usuario ya existe.");
                    verifica = true;
                } else {
                    console.log("El usuario no existe.");
                    verifica = false;
                }
            })
            .catch((error) => {
                console.error("Error al verificar la existencia del usuario:", error);
            });
    }
    if (verifica) {
        document.getElementById('alert').innerHTML = `<div class="alert alert-danger alert-dismissible fade show" role="alert">
        <strong>Este grupo ya existe!</strong> ${nombreGrupo};
        <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close" id="close"></button>
      </div>`;

    } else {
        if (idGrupo == null || idGrupo == undefined || idGrupo == "") {
            const gruposRef = dbRef(database, rutaGrupo);
            const gruposData = {
                nombre_grupo: nombreGrupo
            };
            push(gruposRef, gruposData)
                .then((newGrupoRef) => {
                    //agragar ID
                    const keyGrupo = newGrupoRef.key;
                    let rutaTemp = rutaGrupo + "/" + keyGrupo;
                    let atrib = {
                        id_grupo: keyGrupo,
                        ruta_grupo: rutaTemp
                    };
                    let referenciatemp = dbRef(database, rutaTemp);
                    update(referenciatemp, atrib)
                        .then(() => {
                            console.log('Atributo agregado correctamente.');
                        })
                        .catch((error) => {
                            console.error('Error al agregar el grupo: ', error);
                        });
                    // Crear grupo en coleccion secundaria
                    const grupoRef = dbRef(database, 'grupos/' + keyGrupo);
                    const grupoData = {
                        nombre_grupo: nombreGrupo,
                        id_grupo: keyGrupo,
                        ruta_grupo: rutaTemp
                    };
                    set(grupoRef, grupoData)
                        .then(() => {
                            console.log("ID del nuevo logueo:", keyGrupo);
                        })
                        .catch((error) => {
                            console.error('Error al agregar el grupo: ', error);
                        });


                        console.log("ID del nuevo grupo:", keyGrupo);    
                        //console.log('Grupo agregado correctamente.');
                        document.getElementById('form_subr').reset();
                        document.getElementById('alert').innerHTML=`<div class="alert alert-warning alert-dismissible fade show" role="alert">
                        <strong>Hecho!</strong> ${nombreGrupo} ha sido agregado
                        <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close" id="close"></button>
                      </div>`;
                })
                .catch((error) => {
                    console.error('Error al agregar el grupo: ', error);
                });
        } else {
            let tempRut=rutaGrupo+'/'+idGrupo;
            const grupoData2 = {
                nombre_grupo: nombreGrupo
            };
        const gruposRef2 = dbRef(database, tempRut);
        const lgruposRef2 = dbRef(database, 'grupos/' + idGrupo);
        
        // Agregar el profesor a la base de datos
        update(gruposRef2, grupoData2)
        .then(() => {
            console.log('Profesor agregado correctamente.');
            document.getElementById('form_subr').reset();
            document.getElementById('alert').innerHTML=`<div class="alert alert-warning alert-dismissible fade show" role="alert">
            <strong>Hecho!</strong> ${nombreGrupo} ha sido agregado
            <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close" id="close"></button>
          </div>`;
        })
        .catch((error) => {
            console.error('Error al agregar el profesor: ', error);
        });
        update(lgruposRef2, grupoData2)
        .then(() => {
            console.log('logueo agregado correctamente.');
        })
        .catch((error) => {
            console.error('Error al agregar el profesor: ', error);
        });


        }
    }
}

function borrarGrupe( idDirector,idGrupo,idProfesor) {
    // Referencia al nodo del grupo en la base de datos
    const grupoRef = dbRef(database, `usuarios/${idDirector}/profesores/${idProfesor}/grupos/${idGrupo}`);
  
    // Verifica que grupoRef sea una referencia válida a un nodo de la base de datos
    console.log('grupoRef:', grupoRef);
  
    // Intenta eliminar el grupo de la base de datos
    remove(grupoRef)
        .then(() => {
            console.log('Grupo eliminado correctamente.');
        })
        .catch((error) => {
            console.error('Error al eliminar el grupo: ', error);
        });
  }


consultaVarPers()
    .then(resultado => {
        console.log("si");
        if (tabla_grupos != null) {
            if (resultado) {
                console.log(resultado);
                tabla_grupos.innerHTML += modal;
                mostrarGrupos(resultado);
                const subirGru = document.getElementById('form_subr');
                subirGru.addEventListener('submit', (e) => {
                    e.preventDefault();
                    let idGrupo = document.getElementById('id_c').value;
                    let rutaGrupo = `usuarios/${resultado.id_director}/profesores/${resultado.id_profesor}/grupos`;
                    let nombreGrupo = document.getElementById('nombre_grupo').value;
                    let clave_usuario = resultado.clave_usuario;
                    subirGrupe(idGrupo, rutaGrupo, nombreGrupo, clave_usuario);
                })
            }

        }
    })
    .catch(error => {
        console.error("Error:", error);
    });