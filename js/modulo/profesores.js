// Importar las bibliotecas de Firebase
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import { getAnalytics } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-analytics.js";
import { getDatabase, ref as dbRef, push, child, onValue, remove, set, orderByChild, get, equalTo, query,update } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-database.js";
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";
import { getStorage, ref as storageRef, uploadBytes, getDownloadURL } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-storage.js";
import { app, auth,  database, provider, storage } from "../controller/firebase.js";
import { generateMD5Hash } from "../operedor/codificador.js";


var modal=`<div class="container">
<button type="button" class="btn btn-warning" data-bs-toggle="modal" data-bs-target="#agregaProf">
+Agregar Profesor
</button>
</div>
<div class="modal fade" id="agregaProf" tabindex="-1" aria-labelledby="agregaProfLabel" aria-hidden="true">
  <div class="modal-dialog modal-dialog-centered">
    <div class="modal-content">
      <div class="modal-header">
        <h5 class="modal-title" id="agregaProfLabel">Agregar Profesor</h5>
        <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close" id="close"></button>
      </div>
      <div class="modal-body">
      <form id="form_subr">
      <input type="text" class="form-control" id="id_c" name="id_c" hidden>
      <div class="mb-3">
        <label for="nombre_profesor" class="form-label">Nombre de Profesor</label>
        <input type="text" class="form-control" id="nombre_profesor" name="nombre_profesor" required>
      </div>
      <div class="mb-3">
        <label for="usuario_profesor" class="form-label">Usuario de Profesor</label>
        <input type="text" class="form-control" id="usuario_profesor" name="usuario_profesor" required>
      </div>
      <div class="mb-3">
        <label for="contraseña_profesor" class="form-label">Contraseña de Profesor</label>
        <input type="password" class="form-control" id="contraseña_profesor" name="contraseña_profesor" pattern="^(?=.*[A-Z]).{10,}$" title="La contraseña debe tener al menos 10 caracteres e incluir al menos una mayúscula." required>
        <small id="passwordHelp" class="form-text text-muted">La contraseña debe tener al menos 10 caracteres e incluir al menos una mayúscula.</small>
      </div>
      <div class="mb-3">
        <label for="materia" class="form-label">Materia</label>
        <input type="text" class="form-control" id="materia" name="materia" required>
      </div>
      <button type="submit" class="btn btn-primary">Agregar Profesor</button>
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
            User
            </th>
            <th>
            Materia
            </th>
            <th>
            Opciones
            </th>
        </tr>
    </thead>
    <tbody id="tabla_prof">
    </tbody>
  </table>
</div>
</div>
`;
var verifica=false;

function existe(usuarioProfesor) {
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
                        if (usr.clave_usuario == usuarioProfesor) {
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

async function  subirProfe(idDirector,idProfesor, nombreProfesor, usuarioProfesor, contrasenaProfesor, materia) {
    if (idProfesor==null || idProfesor==undefined || idProfesor=="")  {
    await existe(usuarioProfesor)
        .then((existe) => {
            if (existe) {
                console.log("El usuario ya existe.");
                verifica=true;
            } else {
                console.log("El usuario no existe.");
                verifica=false;
            }
        })
        .catch((error) => {
            console.error("Error al verificar la existencia del usuario:", error);
        });

}
if (verifica) {
    document.getElementById('alert').innerHTML=`<div class="alert alert-danger alert-dismissible fade show" role="alert">
        <strong>Este usuario ya existe!</strong> ${usuarioProfesor};
        <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close" id="close"></button>
      </div>`;
}else{
    if (idProfesor==null || idProfesor==undefined || idProfesor=="")  {
                // Referencia a la colección "profesores" en la base de datos
        const profesoresRef = dbRef(database, 'usuarios/'+idDirector+'/profesores');
        const profesorData = {
            id_director: idDirector,
            id_profesor: idProfesor,
            nombre_profesor: nombreProfesor,
            usuario_profesor: usuarioProfesor,
            contrasena_profesor: contrasenaProfesor,
            materia: materia
        };

        // Agregar el profesor a la base de datos
        push(profesoresRef, profesorData)
        .then((newProfesorRef) => {
            const nuevoProfesorId = newProfesorRef.key;
            let atrib = {
                id_profesor: nuevoProfesorId
            };
            let referenciatemp=dbRef(database, `usuarios/${idDirector}/profesores/${nuevoProfesorId}`);
            update(referenciatemp, atrib)
            .then(() => {
                console.log('Atributo agregado correctamente.');
            })
            .catch((error) => {
                console.error('Error al agregar el profesor: ', error);
            });
            const logueoRef = dbRef(database, 'logueos/' + nuevoProfesorId);
            const logeoData = {
                clave_usuario: usuarioProfesor,
                contrasena: contrasenaProfesor,
                id_profesor: nuevoProfesorId,
                id_director:idDirector,
                materia: materia
            };
                set(logueoRef, logeoData)
                  .then(() => {
                    console.log("ID del nuevo logueo:", nuevoProfesorId);
                  })
                  .catch((error) => {
                    console.error('Error al agregar el profesor: ', error);
                  });
            // Luego puedes utilizar nuevoProfesorId según tus necesidades
            console.log("ID del nuevo profesor:", nuevoProfesorId);    
            //console.log('Profesor agregado correctamente.');
            document.getElementById('form_subr').reset();
            document.getElementById('alert').innerHTML=`<div class="alert alert-warning alert-dismissible fade show" role="alert">
            <strong>Hecho!</strong> ${nombreProfesor} ha sido agregado
            <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close" id="close"></button>
          </div>`;
        })
        .catch((error) => {
            console.error('Error al agregar el profesor: ', error);
        });
    }else{
        const profesorData2 = {
            id_director: idDirector,
            id_profesor: idProfesor,
            nombre_profesor: nombreProfesor,
            usuario_profesor: usuarioProfesor,
            contrasena_profesor: contrasenaProfesor,
            materia: materia
        };
        const logeoData2 = {
            clave_usuario: usuarioProfesor,
            contrasena: contrasenaProfesor,
            id_profesor: idProfesor,
            id_director:idDirector,
            materia: materia
        };
        // Referencia a la colección "profesores" en la base de datos
        const profesoresRef2 = dbRef(database, `usuarios/${idDirector}/profesores/${idProfesor}`);
        const logueoRef2 = dbRef(database, 'logueos/' + idProfesor);
        
        // Agregar el profesor a la base de datos
        update(profesoresRef2, profesorData2)
        .then(() => {
            console.log('Profesor agregado correctamente.');
            document.getElementById('form_subr').reset();
            document.getElementById('alert').innerHTML=`<div class="alert alert-warning alert-dismissible fade show" role="alert">
            <strong>Hecho!</strong> ${nombreProfesor} ha sido agregado
            <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close" id="close"></button>
          </div>`;
        })
        .catch((error) => {
            console.error('Error al agregar el profesor: ', error);
        });
        update(logueoRef2, logeoData2)
        .then(() => {
            console.log('logueo agregado correctamente.');
        })
        .catch((error) => {
            console.error('Error al agregar el profesor: ', error);
        });
    }
}
}


function borrarProfe(idProfesor, idDirector) {
    // Referencia al nodo del profesor en la base de datos
    const profesorRef = dbRef(database, `usuarios/${idDirector}/profesores/${idProfesor}`);

    // Verifica que profesorRef sea una referencia válida a un nodo de la base de datos
    console.log('profesorRef:', profesorRef);

    // Intenta eliminar el profesor de la base de datos
    remove(profesorRef)
        .then(() => {
            console.log('Profesor eliminado correctamente.');
        })
        .catch((error) => {
            console.error('Error al eliminar el profesor: ', error);
        });
}

function mostrarProfesores(idDirector) {
    const profesoresRef = dbRef(database, `usuarios/${idDirector}/profesores`);

    // Escuchar los cambios en los datos de los profesores
    onValue(profesoresRef, (snapshot) => {
        const profesores = snapshot.val();
        const tablaProfesores = document.getElementById('tabla_prof');

        // Limpiar la tabla antes de agregar los nuevos datos
        tablaProfesores.innerHTML = '';

        // Verificar si hay datos de profesores
        if (profesores) {
            // Crear filas para cada profesor
            Object.keys(profesores).forEach((key) => {
                const profesor = profesores[key];
                const fila = `
                    <tr>
                        <td>${profesor.nombre_profesor}</td>
                        <td>${profesor.usuario_profesor}</td>
                        <td>${profesor.materia}</td>
                        <td>
                        <button type="button" id="${key}" class="btn btn-primary boton_editar" data-bs-toggle="modal" data-bs-target="#agregaProf" >Editar</button>
                        <button type="button" id="${key}" class="btn btn-danger boton_eliminar">Eliminar</button>
                        </td>
                    </tr>
                `;
                tablaProfesores.innerHTML += fila;
            });
                        // Agregar eventos clic a los botones de editar y eliminar
                        const botonesEditar = document.querySelectorAll('.boton_editar');
                        const botonesEliminar = document.querySelectorAll('.boton_eliminar');
            
                        botonesEditar.forEach(boton => {
                            boton.addEventListener('click', (event) => {
                                event.preventDefault();
                                const idProfesor = event.target.id;
                                console.log('ID del profesor a editar:', idProfesor);
                                
                                // Obtener la referencia al nodo del profesor específico en la base de datos
                                const profesorRef = dbRef(database, `usuarios/${idDirector}/profesores/${idProfesor}`);
                                
                                // Escuchar los cambios en los datos del profesor
                                onValue(profesorRef, (snapshot) => {
                                    const profesor = snapshot.val();
                                    if (profesor) {
                                        // El profesor fue encontrado, actualizar los campos del formulario con la información del profesor
                                        document.getElementById('nombre_profesor').value = profesor.nombre_profesor;
                                        document.getElementById('usuario_profesor').value = profesor.usuario_profesor;
                                        document.getElementById('contraseña_profesor').value = profesor.contrasena_profesor;
                                        document.getElementById('materia').value = profesor.materia;
                                        document.getElementById('id_c').value = idProfesor; // Asignar el id del profesor al campo oculto id_c
                                        document.getElementById('alert').innerHTML=``;
                                    } else {
                                        // El profesor no fue encontrado
                                        console.log('Profesor no encontrado.');
                                    }
                                }, (error) => {
                                    // Manejar cualquier error que ocurra durante la consulta
                                    console.error('Error al obtener el profesor:', error);
                                });
                            });
                        });
                        
            
                        botonesEliminar.forEach(boton => {
                            boton.addEventListener('click', (event) => {
                                event.preventDefault();
                                const idProfesor = event.target.id;
                                console.log('ID del profesor a eliminar:', idProfesor);
                                borrarProfe(idProfesor, idDirector);
                            });
                        });
        } else {
            // Mostrar un mensaje si no hay profesores
            tablaProfesores.innerHTML = '<tr><td colspan="5">No hay profesores disponibles</td></tr>';
        }
    });
}
const tabla_profesores = document.getElementById('tabla_profesores');
onAuthStateChanged(auth, (user) => { 
    if (tabla_profesores!=null) {
        if (user) {
            tabla_profesores.innerHTML +=modal;
            let idDirector=user.uid;
            mostrarProfesores(idDirector);
            const subirProf=document.getElementById('form_subr');
            subirProf.addEventListener('submit',(e)=>{
                e.preventDefault();
                let idDirector=user.uid;
                let idProfesor=document.getElementById('id_c').value;
                let nombreProfesor=document.getElementById('nombre_profesor').value;
                let usuarioProfesor=document.getElementById('usuario_profesor').value;
                let contrasenaProfesor=document.getElementById('contraseña_profesor').value;
                let materia=document.getElementById('materia').value;
                subirProfe(idDirector,idProfesor, nombreProfesor, usuarioProfesor, contrasenaProfesor, materia);
            })
        }

    }
});


