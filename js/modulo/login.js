// Importar las bibliotecas de Firebase
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import { getAnalytics } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-analytics.js";
import { getDatabase, ref as dbRef, push, child, onValue, remove, set, orderByChild, get, equalTo, query  } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-database.js";
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";
import { getStorage, ref as storageRef, uploadBytes, getDownloadURL } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-storage.js";
import { app, auth, database, provider, storage } from "../controller/firebase.js";
import { generateMD5Hash } from "../operedor/codificador.js";

 var verificaLog;
function existe(usernamef,passwordf) {
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
                        if (usr.clave_usuario == usernamef) {
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
function obtenerUsuario(usernamef, passwordf) {
    return new Promise((resolve, reject) => {
        const logueosRef = dbRef(database, 'logueos');

        // Obtener una instantánea de los datos en la colección "logueos"
        get(logueosRef).then((snapshot) => {
            if (snapshot.exists()) {
                let data = snapshot.val();
                if (data) {
                    let usuarioEncontrado = null; // Objeto para almacenar los datos del usuario encontrado
                    Object.keys(data).forEach((key) => {
                        const usr = data[key];
                        if (usr.clave_usuario == usernamef && usr.contrasena == passwordf) {
                            console.log("Usuario encontrado.");
                            usuarioEncontrado = usr; // Almacenar los datos del usuario encontrado
                        }
                    });
                    resolve(usuarioEncontrado); // Resolver la promesa con los datos del usuario encontrado
                }
            } else {
                console.log('No hay datos disponibles en la colección "logueos".');
                resolve(null); // Resolver la promesa con un valor nulo si no se encontraron datos
            }
        }).catch((error) => {
            console.error('Error al obtener los datos:', error);
            reject(error); // Rechazar la promesa si ocurre un error
        });
    });
}


export async function mandarDatos(usernamef, passwordf) {
    try {
        let verificaLog = await existe(usernamef, passwordf);

        if (verificaLog) {
            let nuevoObjeto = await obtenerUsuario(usernamef, passwordf);
            await agregarVarPers(nuevoObjeto);
            console.log("logueado."); 
        } else {
            console.log("El usuario no existe.");
        }
        
        return verificaLog;
    } catch (error) {
        console.error("Error al verificar la existencia del usuario:", error);
        return false; // Manejo de error, devuelve false
    }
}



// operadorVar.js

// Función para consultar la variable persistente
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

// Función para limpiar todos los datos de la variable persistente
function limpiarVarPers() {
    return new Promise((resolve, reject) => {
        try {
            localStorage.clear(); // Limpiar todos los datos del almacenamiento local
            resolve(); // Resuelve la promesa una vez que se han eliminado todos los datos
        } catch (error) {
            reject(error); // Rechaza la promesa si hay un error al limpiar los datos
        }
    });
}
// Función para modificar la variable persistente
function modificaVarPers(loguerModificado) {
    return new Promise((resolve, reject) => {
        localStorage.setItem('loguer', JSON.stringify(loguerModificado)); // Actualiza la variable persistente en el almacenamiento local
        resolve(); // Resuelve la promesa una vez que se ha modificado la variable persistente
    });
}


// Función para agregar datos a la variable persistente
function agregarVarPers(nuevoDato) {
    return new Promise((resolve, reject) => {
        // Consultar la variable persistente
        var loguerPersistente = consultaVarPers();

        // Cuando la consulta se completa con éxito
        loguerPersistente.then(data => {
            // Si la variable persistente existe, la modificamos
            var loguerModificado = { ...data, ...nuevoDato };
            modificaVarPers(loguerModificado)
                .then(() => {
                    resolve(); // Resuelve la promesa una vez que se ha modificado la variable persistente
                })
                .catch(error => {
                    reject(error); // Rechaza la promesa si hay un error al modificar la variable persistente
                });
        })
        .catch(() => {
            // Si la variable persistente no existe, la creamos
            modificaVarPers(nuevoDato)
                .then(() => {
                    resolve(); // Resuelve la promesa una vez que se ha creado la variable persistente
                })
                .catch(error => {
                    reject(error); // Rechaza la promesa si hay un error al crear la variable persistente
                });
        });
    });
}


function loginuser(usernamef,passwordf) {
    return new Promise((resolve, reject) => {
        const logueosRef = dbRef(database, 'logueos');

        // Obtener una instantánea de los datos en la colección "logueos"
        get(logueosRef).then((snapshot) => {
            if (snapshot.exists()) {
                let data = snapshot.val();
                if (data) {
                    let usuarioEncontrado = "";
                    Object.keys(data).forEach((key) => {
                        const usr = data[key];
                        if (usr.clave_usuario == usernamef && usr.contrasena == passwordf) {
                            console.log("Usuario encontrado."+key);
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

// Exportar las funciones para ser utilizadas en otros archivos
export { consultaVarPers, modificaVarPers, agregarVarPers , limpiarVarPers , loginuser};
 