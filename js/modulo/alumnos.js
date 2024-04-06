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
<button type="button" class="btn btn-warning" data-bs-toggle="modal" data-bs-target="#agregaAluo">
+Agregar Alumno
</button>
</div>
<div class="modal fade" id="agregaAluo" tabindex="-1" aria-labelledby="agregaAluoLabel" aria-hidden="true">
  <div class="modal-dialog modal-dialog-centered">
    <div class="modal-content">
      <div class="modal-header">
        <h5 class="modal-title" id="agregaAluoLabel">Agregar Alumno</h5>
        <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close" id="close"></button>
      </div>
      <div class="modal-body">
        <form id="form_subr">
        <input type="text" class="form-control" id="id_c" name="id_c" hidden>
        <input type="text" class="form-control" id="ruta" name="ruta" hidden>
        <input type="text" class="form-control" id="idG" name="idG" hidden>
          <div class="mb-3">
            <label for="nombre_alumno" class="form-label">Nombre de Alumno</label>
            <input type="text" class="form-control" id="nombre_alumno" name="nombre_alumno">
          </div>
          <div class="mb-3">
          <label for="contra_alumno" class="form-label">Contraseña de Alumno</label>
          <input type="text" class="form-control" id="contra_alumno" name="contra_alumno">
        </div>
          <button type="submit" class="btn btn-primary">Agregar Alumno</button>
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
        </tr>
    </thead>
    <tbody id="tabla_alum">
    </tbody>
  </table>
</div>
</div>
`;
var verifica = false;
function existe(nombreAlumno) {
    return new Promise((resolve, reject) => {
        const logueosRef = dbRef(database, 'logueos');

        // Obtener una instantánea de los datos en la colección "logueos"
        get(logueosRef).then((snapshot) => {
            if (snapshot.exists()) {
                let data = snapshot.val();
                if (data) {
                    let usuarioEncontrado = false;
                    Object.keys(data).forEach((key) => {
                        const usr = data[key];
                        if (usr.clave_usuario == nombreAlumno) {
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

function mostrarAlumnos(resultado) {
    const alumnosRef = dbRef(database, `usuarios/${resultado.id_director}/profesores/${resultado.id_profesor}/grupos/${resultado.id_grupo}/alumnos`);
    // Escuchar los cambios en los datos de los alumnos
    onValue(alumnosRef, (snapshot) => {
        const alumnos = snapshot.val();
        const tablaAlumnos = document.getElementById('tabla_alum');

        // Limpiar la tabla antes de agregar los nuevos datos
        tablaAlumnos.innerHTML = '';
        if (alumnos) {
            Object.keys(alumnos).forEach((key) => {
                const alumno = alumnos[key];
                const fila = `
                <tr>
                    <td>${alumno.clave_usuario}</td>
                    <td>
                    <button type="button" id="${key}" class="btn btn-primary boton_editar" data-bs-toggle="modal" data-bs-target="#agregaAluo" >Editar</button>
                    <button type="button" id="${key}" class="btn btn-danger boton_eliminar">Eliminar</button>
                    </td>
                </tr>
            `;
                tablaAlumnos.innerHTML += fila;
            });
            const botonesEditar = document.querySelectorAll('.boton_editar');
            const botonesEliminar = document.querySelectorAll('.boton_eliminar');
            botonesEditar.forEach(boton => {
                boton.addEventListener('click', (event) => {
                    event.preventDefault();
                    const idAlumno = event.target.id;
                    console.log('ID del alumno a editar:', idAlumno);
                    const alumnoRef = dbRef(database, `usuarios/${resultado.id_director}/profesores/${resultado.id_profesor}/grupos/${resultado.id_grupo}/alumnos/${idAlumno}`);
                    onValue(alumnoRef, (snapshot) => {
                        const alumno = snapshot.val();
                        console.log(alumno);
                        if (alumno) {
                            // El alumno fue encontrado, actualizar los campos del formulario con la información del alumno
                            document.getElementById('nombre_alumno').value = alumno.clave_usuario;
                            document.getElementById('contra_alumno').value = alumno.contrasena;
                            document.getElementById('idG').value = alumno.id_grupo;
                            document.getElementById('id_c').value = alumno.id_alumno; // Asignar el id del alumno al campo oculto id_c
                            document.getElementById('alert').innerHTML = ``;
                        } else {
                            // El alumno no fue encontrado
                            console.log('Alumno no encontrado.');
                        }
                    }, (error) => {
                        // Manejar cualquier error que ocurra durante la consulta
                        console.error('Error al obtener el alumno:', error);
                    });
                });
            });


            botonesEliminar.forEach(boton => {
                boton.addEventListener('click', (event) => {
                    event.preventDefault();
                    const idAlumno = event.target.id;
                    console.log('ID del alumno a eliminar:', idAlumno);
                    borrarAlumne(resultado.id_director, idAlumno, resultado.id_profesor,resultado.id_grupo);
                });
            });
        }
    })
}
async function subirAlumne(idAlumno, rutaAlumno, nombreAlumno, clave_usuario, contraAlumno,idGrupo,idProfesor,idDirector ) {
    if (idAlumno == null || idAlumno == undefined || idAlumno == "") {
        await existe(nombreAlumno)
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
        <strong>Este alumno ya existe!</strong> ${nombreAlumno};
        <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close" id="close"></button>
      </div>`;

    } else {
        if (idAlumno == null || idAlumno == undefined || idAlumno == "") {
            const alumnosRef = dbRef(database, rutaAlumno);
            const alumnosData = {
                clave_usuario: nombreAlumno,
                contrasena: contraAlumno,
                id_grupo:idGrupo,
                id_profesor:idProfesor
            };
            push(alumnosRef, alumnosData)
                .then((newAlumnoRef) => {
                    //agragar ID
                    const keyAlumno = newAlumnoRef.key;
                    let rutaTemp = rutaAlumno + "/" + keyAlumno;
                    let atrib = {
                        id_alumno: keyAlumno,
                        ruta_alumno: rutaTemp
                    };
                    let referenciatemp = dbRef(database, rutaTemp);
                    update(referenciatemp, atrib)
                        .then(() => {
                            console.log('Atributo agregado correctamente.');
                        })
                        .catch((error) => {
                            console.error('Error al agregar el alumno: ', error);
                        });
                    // Crear alumno en coleccion secundaria
                    const alumnoRef = dbRef(database, 'logueos/' + keyAlumno);
                    const alumnoData = {
                        clave_usuario: nombreAlumno,
                        contrasena: contraAlumno,
                        id_alumno: keyAlumno,
                        ruta_alumno: rutaTemp,
                        id_grupo:idGrupo,
                        id_profesor:idProfesor,
                        id_director:idDirector
                    };
                    set(alumnoRef, alumnoData)
                        .then(() => {
                            console.log("ID del nuevo logueo:", keyAlumno);
                        })
                        .catch((error) => {
                            console.error('Error al agregar el alumno: ', error);
                        });


                    console.log("ID del nuevo alumno:", keyAlumno);
                    //console.log('Alumno agregado correctamente.');
                    document.getElementById('form_subr').reset();
                    document.getElementById('alert').innerHTML = `<div class="alert alert-warning alert-dismissible fade show" role="alert">
                        <strong>Hecho!</strong> ${nombreAlumno} ha sido agregado
                        <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close" id="close"></button>
                      </div>`;
                })
                .catch((error) => {
                    console.error('Error al agregar el alumno: ', error);
                });
        } else {
            let tempRut = rutaAlumno + '/' + idAlumno;
            const alumnoData2 = {
                clave_usuario: nombreAlumno,
                contrasena: contraAlumno
            };
            const alumnosRef2 = dbRef(database, tempRut);
            const lalumnosRef2 = dbRef(database, 'logueos/' + idAlumno);

            // Agregar el profesor a la base de datos
            update(alumnosRef2, alumnoData2)
                .then(() => {
                    console.log('Profesor agregado correctamente.');
                    document.getElementById('form_subr').reset();
                    document.getElementById('alert').innerHTML = `<div class="alert alert-warning alert-dismissible fade show" role="alert">
            <strong>Hecho!</strong> ${nombreAlumno} ha sido agregado
            <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close" id="close"></button>
          </div>`;
                })
                .catch((error) => {
                    console.error('Error al agregar el profesor: ', error);
                });
            update(lalumnosRef2, alumnoData2)
                .then(() => {
                    console.log('logueo agregado correctamente.');
                })
                .catch((error) => {
                    console.error('Error al agregar el profesor: ', error);
                });


        }
    }
}

function borrarAlumne(idDirector, idAlumno, idProfesor, id_grupo) {
    // Referencia al nodo del alumno en la base de datos
    const alumnoRef = dbRef(database, `usuarios/${idDirector}/profesores/${idProfesor}/grupos/${id_grupo}/alumnos/${idAlumno}`);

    // Verifica que alumnoRef sea una referencia válida a un nodo de la base de datos
    console.log('alumnoRef:', alumnoRef);

    // Intenta eliminar el alumno de la base de datos
    remove(alumnoRef)
        .then(() => {
            console.log('Alumno eliminado correctamente.');
        })
        .catch((error) => {
            console.error('Error al eliminar el alumno: ', error);
        });
}


consultaVarPers()
    .then(resultado => {
        console.log("si");
        if (tabla_alumnos != null) {
            if (resultado) {
                const urlParams = new URLSearchParams(window.location.search);
                const id = urlParams.get('id');
                let idGrupo=id
                    // Mostrar el ID en la página
                    if (id) {
                        const mensaje = `El ID recibido en la URL es: ${id}`;
                        console.log(mensaje);
                    }
                console.log(idGrupo);
                tabla_alumnos.innerHTML += modal;
                resultado.id_grupo=idGrupo;
                mostrarAlumnos(resultado);
                const subirAluo = document.getElementById('form_subr');
                subirAluo.addEventListener('submit', (e) => {
                    e.preventDefault();
                    let idAlumno = document.getElementById('id_c').value;
                    let rutaAlumno = `usuarios/${resultado.id_director}/profesores/${resultado.id_profesor}/grupos/${idGrupo}/alumnos`;
                    let nombreAlumno = document.getElementById('nombre_alumno').value;
                    let contraAlumno = document.getElementById('contra_alumno').value;
                    let idProfesor = resultado.id_profesor;
                    let idDirector  = resultado.id_director;
                    let clave_usuario = resultado.clave_usuario;
                    subirAlumne(idAlumno, rutaAlumno, nombreAlumno, clave_usuario, contraAlumno,idGrupo,idProfesor,idDirector );
                })
            }

        }
    })
    .catch(error => {
        console.error("Error:", error);
    });