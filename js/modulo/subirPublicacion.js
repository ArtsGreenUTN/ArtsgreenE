// Importar las bibliotecas de Firebase
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import { getAnalytics } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-analytics.js";
import { getDatabase, ref as dbRef, push, set} from "https://www.gstatic.com/firebasejs/10.8.0/firebase-database.js";
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";
import { getStorage, ref as storageRef, uploadBytes, getDownloadURL } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-storage.js";
import { app, auth,  database, provider, storage } from "../controller/firebase.js";
import { generateMD5Hash } from "../operedor/codificador.js";

//formulario
const subirPublicacion = document.getElementById('subirPublicacion');
if (subirPublicacion!=null) {
    
    onAuthStateChanged(auth, (user) => { 
        if (user) {
            
            const enviarFormulario = async (e) => {
                e.preventDefault();
                
                // Obtener los valores del formulario
                const titulo = document.getElementById('titulo').value;
                const descripcion = document.getElementById('descripcion').value;
                const materiales = document.getElementById('materiales').value;
                const archivo = document.getElementById('video').files[0];
                const fecha_subida = new Date().toISOString();
                const usuarioCadena= user.uid;
                
                // Mostrar el spinner de carga
                document.getElementById('spinner').classList.add('d-block');
                
                function rutaFormateadaUsuario() {
                    var parte2,parte3,parte4,parte5;
                    parte2=generateMD5Hash(titulo);
                    parte3=generateMD5Hash(fecha_subida);
                    return parte2+parte3
                }
                
                try {
                    // Subir el archivo a Firebase Storage
                    let ruta= rutaFormateadaUsuario();
                const refeS = storageRef(storage, 'publicaciones/'+usuarioCadena+'/'+ruta+'/'+ruta);
                await uploadBytes(refeS, archivo);
                
                // Obtener la URL del archivo subido
                const archivoUrl = await getDownloadURL(refeS);
                console.log(fecha_subida);
                // Guardar los datos del formulario en Firebase Realtime Database
                await set(dbRef(database, 'usuarios/'+usuarioCadena+'/publicaciones/'+ruta), {
                    titulo: titulo,
                    descripcion: descripcion,
                    materiales: materiales,
                    fecha_subida:fecha_subida,                    
                    archivoUrl: archivoUrl

                })
                    set(dbRef(database, 'publicaciones/publis/'+ruta), {
                        titulo: titulo,
                        descripcion: descripcion,
                        materiales: materiales,
                        fecha_subida:fecha_subida,                    
                        archivoUrl: archivoUrl,
                        id_db_video:ruta
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
    }
});

}