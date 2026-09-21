// ============================================================
// GESBANK
// app.js
// ============================================================

// ============================================================
// FIREBASE
// ============================================================

import { initializeApp } from
    "https://www.gstatic.com/firebasejs/12.1.0/firebase-app.js";

import {
    getAuth,
    createUserWithEmailAndPassword,
    signInWithEmailAndPassword,
    onAuthStateChanged,
    signOut,
    updateProfile
} from
    "https://www.gstatic.com/firebasejs/12.1.0/firebase-auth.js";

import {
    getFirestore,
    doc,
    setDoc,
    getDoc,
    serverTimestamp
} from
    "https://www.gstatic.com/firebasejs/12.1.0/firebase-firestore.js";


// ============================================================
// CONFIGURACIÓN FIREBASE
// ============================================================

const firebaseConfig = {

    apiKey: "AIzaSyD3BxOZbaaJimSmzc7Ek5t0DOBJTrNWqS",

    authDomain: "gesbank-d3e55.firebaseapp.com",

    projectId: "gesbank-d3e55",

    storageBucket: "gesbank-d3e55.firebasestorage.app",

    messagingSenderId: "634695016427",

    appId: "1:634695016427:web:b173d46e96407bc6fac3ae"

};


// ============================================================
// INICIALIZAR FIREBASE
// ============================================================

const app = initializeApp(firebaseConfig);

const auth = getAuth(app);

const db = getFirestore(app);


// ============================================================
// ELEMENTOS
// ============================================================

const pantallaLogin =
    document.getElementById("pantallaLogin");

const pantallaRegistro =
    document.getElementById("pantallaRegistro");

const pantallaPanel =
    document.getElementById("pantallaPanel");

const formLogin =
    document.getElementById("formLogin");

const formRegistro =
    document.getElementById("formRegistro");

const btnCerrarSesion =
    document.getElementById("btnCerrarSesion");

const loginMensaje =
    document.getElementById("loginMensaje");

const registroMensaje =
    document.getElementById("registroMensaje");


// ============================================================
// MOSTRAR LOGIN
// ============================================================

function mostrarLogin() {

    if (pantallaLogin) {
        pantallaLogin.classList.remove("hidden");
    }

    if (pantallaRegistro) {
        pantallaRegistro.classList.add("hidden");
    }

    if (pantallaPanel) {
        pantallaPanel.classList.add("hidden");
    }

    if (btnCerrarSesion) {
        btnCerrarSesion.classList.add("hidden");
    }

    limpiarMensajes();

}


// ============================================================
// MOSTRAR REGISTRO
// ============================================================

function mostrarRegistro() {

    console.log("GESBANK: mostrando registro");

    if (pantallaLogin) {
        pantallaLogin.classList.add("hidden");
    }

    if (pantallaRegistro) {
        pantallaRegistro.classList.remove("hidden");
    }

    if (pantallaPanel) {
        pantallaPanel.classList.add("hidden");
    }

    if (btnCerrarSesion) {
        btnCerrarSesion.classList.add("hidden");
    }

    limpiarMensajes();

    window.scrollTo({
        top: 0,
        behavior: "smooth"
    });

}


// ============================================================
// HACER LAS FUNCIONES ACCESIBLES DESDE HTML
// ============================================================

window.mostrarLogin = mostrarLogin;

window.mostrarRegistro = mostrarRegistro;


// ============================================================
// MENSAJES
// ============================================================

function limpiarMensajes() {

    if (loginMensaje) {
        loginMensaje.textContent = "";
        loginMensaje.className = "mensaje";
    }

    if (registroMensaje) {
        registroMensaje.textContent = "";
        registroMensaje.className = "mensaje";
    }

}


function mostrarLoginMensaje(
    texto,
    tipo = "error"
) {

    if (!loginMensaje) return;

    loginMensaje.textContent = texto;

    loginMensaje.className =
        `mensaje ${tipo}`;

}


function mostrarRegistroMensaje(
    texto,
    tipo = "error"
) {

    if (!registroMensaje) return;

    registroMensaje.textContent = texto;

    registroMensaje.className =
        `mensaje ${tipo}`;

}


// ============================================================
// GENERAR ID DE CUENTA
// ============================================================

function generarAccountId() {

    const numero =
        Math.floor(
            10000000 +
            Math.random() * 90000000
        );

    return `GB${numero}`;

}


// ============================================================
// GENERAR ALIAS
// ============================================================

function generarAlias(nombre, apellido) {

    const limpiar = texto => {

        return texto
            .normalize("NFD")
            .replace(/[\u0300-\u036f]/g, "")
            .toLowerCase()
            .replace(/[^a-z0-9]/g, "");

    };

    const nombreLimpio =
        limpiar(nombre);

    const apellidoLimpio =
        limpiar(apellido);

    const numero =
        Math.floor(
            100 +
            Math.random() * 900
        );

    return `${nombreLimpio}.${apellidoLimpio}.${numero}`;

}


// ============================================================
// VALIDAR DNI
// ============================================================

function validarDNI(dni) {

    const valor =
        String(dni).replace(/\D/g, "");

    return (
        valor.length >= 7 &&
        valor.length <= 9
    );

}


// ============================================================
// VALIDAR TOKEN
// ============================================================

function validarToken(token) {

    return /^\d{6}$/.test(token);

}


// ============================================================
// REGISTRO
// ============================================================

if (formRegistro) {

    formRegistro.addEventListener(
        "submit",
        async function(event) {

            event.preventDefault();

            limpiarMensajes();


            // ------------------------------------------------
            // DATOS
            // ------------------------------------------------

            const nombre =
                document.getElementById("nombre")
                    ?.value
                    .trim();

            const apellido =
                document.getElementById("apellido")
                    ?.value
                    .trim();

            const dni =
                document.getElementById("dni")
                    ?.value
                    .trim();

            const fechaNacimiento =
                document.getElementById("fechaNacimiento")
                    ?.value;

            const nacionalidad =
                document.getElementById("nacionalidad")
                    ?.value
                    .trim();

            const domicilio =
                document.getElementById("domicilio")
                    ?.value
                    .trim();

            const ciudad =
                document.getElementById("ciudad")
                    ?.value
                    .trim();

            const provincia =
                document.getElementById("provincia")
                    ?.value
                    .trim();

            const telefono =
                document.getElementById("telefono")
                    ?.value
                    .trim();

            const email =
                document.getElementById("registroEmail")
                    ?.value
                    .trim()
                    .toLowerCase();

            const password =
                document.getElementById("registroPassword")
                    ?.value;

            const confirmarPassword =
                document.getElementById("confirmarPassword")
                    ?.value;

            const token =
                document.getElementById("tokenSeguridad")
                    ?.value;

            const confirmarToken =
                document.getElementById("confirmarToken")
                    ?.value;


            // ------------------------------------------------
            // ARCHIVOS
            // ------------------------------------------------

            const dniFrente =
                document.getElementById("dniFrente")
                    ?.files?.[0];

            const dniDorso =
                document.getElementById("dniDorso")
                    ?.files?.[0];

            const selfie =
                document.getElementById("selfie")
                    ?.files?.[0];


            // ------------------------------------------------
            // CHECKBOX
            // ------------------------------------------------

            const aceptaTerminos =
                document.getElementById("aceptaTerminos")
                    ?.checked;

            const aceptaPrivacidad =
                document.getElementById("aceptaPrivacidad")
                    ?.checked;


            // =================================================
            // VALIDACIONES
            // =================================================

            if (
                !nombre ||
                !apellido ||
                !dni ||
                !fechaNacimiento ||
                !nacionalidad
            ) {

                mostrarRegistroMensaje(
                    "Completá todos los datos personales."
                );

                return;
            }


            if (!validarDNI(dni)) {

                mostrarRegistroMensaje(
                    "El DNI debe contener entre 7 y 9 números."
                );

                return;
            }


            if (
                !domicilio ||
                !ciudad ||
                !provincia
            ) {

                mostrarRegistroMensaje(
                    "Completá todos los datos de domicilio."
                );

                return;
            }


            if (
                !telefono ||
                !email
            ) {

                mostrarRegistroMensaje(
                    "Completá los datos de contacto."
                );

                return;
            }


            if (!dniFrente) {

                mostrarRegistroMensaje(
                    "Seleccioná la foto del frente del DNI."
                );

                return;
            }


            if (!dniDorso) {

                mostrarRegistroMensaje(
                    "Seleccioná la foto del dorso del DNI."
                );

                return;
            }


            if (!selfie) {

                mostrarRegistroMensaje(
                    "Seleccioná la foto de verificación."
                );

                return;
            }


            if (!password || password.length < 8) {

                mostrarRegistroMensaje(
                    "La contraseña debe tener al menos 8 caracteres."
                );

                return;
            }


            if (password !== confirmarPassword) {

                mostrarRegistroMensaje(
                    "Las contraseñas no coinciden."
                );

                return;
            }


            if (!validarToken(token)) {

                mostrarRegistroMensaje(
                    "El Token de Seguridad debe tener exactamente 6 números."
                );

                return;
            }


            if (token !== confirmarToken) {

                mostrarRegistroMensaje(
                    "Los Tokens de Seguridad no coinciden."
                );

                return;
            }


            if (!aceptaTerminos) {

                mostrarRegistroMensaje(
                    "Debés aceptar los términos y condiciones."
                );

                return;
            }


            if (!aceptaPrivacidad) {

                mostrarRegistroMensaje(
                    "Debés aceptar la política de privacidad."
                );

                return;
            }


            // =================================================
            // DESHABILITAR BOTÓN
            // =================================================

            const botonRegistro =
                formRegistro.querySelector(
                    'button[type="submit"]'
                );

            if (botonRegistro) {

                botonRegistro.disabled = true;

                botonRegistro.textContent =
                    "Creando cuenta...";

            }


            try {

                // =================================================
                // CREAR USUARIO FIREBASE AUTH
                // =================================================

                const credencial =
                    await createUserWithEmailAndPassword(
                        auth,
                        email,
                        password
                    );


                const usuario =
                    credencial.user;


                // =================================================
                // ACTUALIZAR NOMBRE
                // =================================================

                await updateProfile(
                    usuario,
                    {
                        displayName:
                            `${nombre} ${apellido}`
                    }
                );


                // =================================================
                // GENERAR DATOS DE CUENTA
                // =================================================

                const accountId =
                    generarAccountId();

                const alias =
                    generarAlias(
                        nombre,
                        apellido
                    );


                // =================================================
                // GUARDAR CUENTA EN FIRESTORE
                // =================================================

                await setDoc(
                    doc(
                        db,
                        "cuentas",
                        usuario.uid
                    ),
                    {

                        uid:
                            usuario.uid,

                        accountId:
                            accountId,

                        alias:
                            alias,

                        nombre:
                            nombre,

                        apellido:
                            apellido,

                        dni:
                            dni,

                        fechaNacimiento:
                            fechaNacimiento,

                        nacionalidad:
                            nacionalidad,

                        domicilio:
                            domicilio,

                        ciudad:
                            ciudad,

                        provincia:
                            provincia,

                        telefono:
                            telefono,

                        email:
                            email,

                        saldo:
                            0,

                        moneda:
                            "ARS",

                        estadoCuenta:
                            "VERIFICACION_PENDIENTE",

                        verificacionIdentidad:
                            "PENDIENTE",

                        dniFrenteSeleccionado:
                            true,

                        dniDorsoSeleccionado:
                            true,

                        selfieSeleccionada:
                            true,

                        telefonoVerificado:
                            false,

                        emailVerificado:
                            false,

                        seguridad: {

                            tokenConfigurado:
                                true

                        },

                        aceptaTerminos:
                            true,

                        aceptaPrivacidad:
                            true,

                        createdAt:
                            serverTimestamp()

                    }
                );


                // =================================================
                // REGISTRO CORRECTO
                // =================================================

                mostrarRegistroMensaje(
                    "Cuenta creada correctamente. Ingresando...",
                    "success"
                );


                // Esperamos un momento para mostrar mensaje

                setTimeout(
                    () => {

                        mostrarPanel(
                            usuario
                        );

                    },
                    800
                );


            } catch (error) {

                console.error(
                    "Error al crear cuenta:",
                    error
                );


                let mensaje =
                    "No se pudo crear la cuenta.";


                switch (error.code) {

                    case "auth/email-already-in-use":

                        mensaje =
                            "Ese email ya está registrado.";

                        break;


                    case "auth/invalid-email":

                        mensaje =
                            "El email ingresado no es válido.";

                        break;


                    case "auth/weak-password":

                        mensaje =
                            "La contraseña es demasiado débil.";

                        break;


                    case "auth/operation-not-allowed":

                        mensaje =
                            "El acceso por email y contraseña no está habilitado en Firebase.";

                        break;


                    case "auth/network-request-failed":

                        mensaje =
                            "No hay conexión con Firebase.";

                        break;


                    case "permission-denied":

                        mensaje =
                            "Firebase rechazó el acceso a la base de datos. Revisá las reglas de Firestore.";

                        break;


                    default:

                        mensaje =
                            `${error.message || "Error desconocido."}`;

                }


                mostrarRegistroMensaje(
                    mensaje
                );


                // Si Auth creó el usuario pero Firestore falló,
                // no guardamos datos sensibles ni mostramos
                // la cuenta como terminada.


            } finally {

                if (botonRegistro) {

                    botonRegistro.disabled = false;

                    botonRegistro.textContent =
                        "Crear cuenta GESBANK";

                }

            }

        }
    );

}


// ============================================================
// LOGIN
// ============================================================

if (formLogin) {

    formLogin.addEventListener(
        "submit",
        async function(event) {

            event.preventDefault();

            limpiarMensajes();


            const email =
                document.getElementById("loginEmail")
                    ?.value
                    .trim()
                    .toLowerCase();

            const password =
                document.getElementById("loginPassword")
                    ?.value;


            if (!email || !password) {

                mostrarLoginMensaje(
                    "Completá el email y la contraseña."
                );

                return;
            }


            const botonLogin =
                formLogin.querySelector(
                    'button[type="submit"]'
                );


            if (botonLogin) {

                botonLogin.disabled = true;

                botonLogin.textContent =
                    "Ingresando...";

            }


            try {

                const credencial =
                    await signInWithEmailAndPassword(
                        auth,
                        email,
                        password
                    );


                await mostrarPanel(
                    credencial.user
                );


            } catch (error) {

                console.error(
                    "Error de login:",
                    error
                );


                let mensaje =
                    "No se pudo iniciar sesión.";


                switch (error.code) {

                    case "auth/invalid-credential":

                        mensaje =
                            "Email o contraseña incorrectos.";

                        break;


                    case "auth/user-not-found":

                        mensaje =
                            "No existe una cuenta con ese email.";

                       
