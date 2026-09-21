// ============================================================
// GESBANK
// Aplicación bancaria de demostración
// Firebase Authentication + Firestore
// ============================================================

import {
    initializeApp
} from "https://www.gstatic.com/firebasejs/12.1.0/firebase-app.js";

import {
    getAuth,
    createUserWithEmailAndPassword,
    signInWithEmailAndPassword,
    onAuthStateChanged,
    signOut,
    updateProfile
} from "https://www.gstatic.com/firebasejs/12.1.0/firebase-auth.js";

import {
    getFirestore,
    doc,
    setDoc,
    getDoc,
    serverTimestamp
} from "https://www.gstatic.com/firebasejs/12.1.0/firebase-firestore.js";


// ============================================================
// CONFIGURACIÓN FIREBASE
// ============================================================

const firebaseConfig = {

    apiKey:
        "AIzaSyD3BxOZbaaJimSmzc7Ek5t0DOBJTrNWqS",

    authDomain:
        "gesbank-d3e55.firebaseapp.com",

    projectId:
        "gesbank-d3e55",

    storageBucket:
        "gesbank-d3e55.firebasestorage.app",

    messagingSenderId:
        "634695016427",

    appId:
        "1:634695016427:web:b173d46e96407bc6fac3ae"
};


// ============================================================
// FIREBASE
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

const btnMostrarRegistro =
    document.getElementById("btnMostrarRegistro");

const btnVolverLogin =
    document.getElementById("btnVolverLogin");

const btnCerrarSesion =
    document.getElementById("btnCerrarSesion");

const formLogin =
    document.getElementById("formLogin");

const formRegistro =
    document.getElementById("formRegistro");

const loginMensaje =
    document.getElementById("loginMensaje");

const registroMensaje =
    document.getElementById("registroMensaje");


// ============================================================
// CAMBIO DE PANTALLA
// ============================================================

function mostrarLogin() {

    pantallaLogin.classList.remove("hidden");

    pantallaRegistro.classList.add("hidden");

    pantallaPanel.classList.add("hidden");

    btnCerrarSesion.classList.add("hidden");
}


function mostrarRegistro() {

    pantallaLogin.classList.add("hidden");

    pantallaRegistro.classList.remove("hidden");

    pantallaPanel.classList.add("hidden");

    btnCerrarSesion.classList.add("hidden");

    registroMensaje.textContent = "";
}


function mostrarPanel() {

    pantallaLogin.classList.add("hidden");

    pantallaRegistro.classList.add("hidden");

    pantallaPanel.classList.remove("hidden");

    btnCerrarSesion.classList.remove("hidden");
}


// ============================================================
// MOSTRAR REGISTRO
// ============================================================

btnMostrarRegistro.addEventListener(
    "click",
    mostrarRegistro
);


// ============================================================
// VOLVER AL LOGIN
// ============================================================

btnVolverLogin.addEventListener(
    "click",
    mostrarLogin
);


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

    const n =
        nombre
            .trim()
            .toLowerCase()
            .replace(/\s+/g, "");

    const a =
        apellido
            .trim()
            .toLowerCase()
            .replace(/\s+/g, "");

    const numero =
        Math.floor(
            100 +
            Math.random() * 900
        );

    return `${n}.${a}.${numero}`;
}


// ============================================================
// VALIDAR TOKEN
// ============================================================

function tokenValido(token) {

    return /^[0-9]{6}$/.test(token);
}


// ============================================================
// VALIDAR DNI
// ============================================================

function dniValido(dni) {

    const limpio =
        dni
            .replace(/\D/g, "");

    return (
        limpio.length >= 7 &&
        limpio.length <= 9
    );
}


// ============================================================
// REGISTRO
// ============================================================

formRegistro.addEventListener(
    "submit",
    async (event) => {

        event.preventDefault();

        registroMensaje.textContent =
            "Creando tu cuenta segura...";


        try {

            // ------------------------------------------------
            // DATOS PERSONALES
            // ------------------------------------------------

            const nombre =
                document
                    .getElementById("nombre")
                    .value
                    .trim();

            const apellido =
                document
                    .getElementById("apellido")
                    .value
                    .trim();

            const dni =
                document
                    .getElementById("dni")
                    .value
                    .trim();

            const fechaNacimiento =
                document
                    .getElementById("fechaNacimiento")
                    .value;

            const nacionalidad =
                document
                    .getElementById("nacionalidad")
                    .value
                    .trim();


            // ------------------------------------------------
            // DOMICILIO
            // ------------------------------------------------

            const domicilio =
                document
                    .getElementById("domicilio")
                    .value
                    .trim();

            const ciudad =
                document
                    .getElementById("ciudad")
                    .value
                    .trim();

            const provincia =
                document
                    .getElementById("provincia")
                    .value
                    .trim();


            // ------------------------------------------------
            // CONTACTO
            // ------------------------------------------------

            const telefono =
                document
                    .getElementById("telefono")
                    .value
                    .trim();

            const email =
                document
                    .getElementById("registroEmail")
                    .value
                    .trim()
                    .toLowerCase();


            // ------------------------------------------------
            // SEGURIDAD
            // ------------------------------------------------

            const password =
                document
                    .getElementById("registroPassword")
                    .value;

            const confirmarPassword =
                document
                    .getElementById("confirmarPassword")
                    .value;

            const token =
                document
                    .getElementById("tokenSeguridad")
                    .value;

            const confirmarToken =
                document
                    .getElementById("confirmarToken")
                    .value;


            // ------------------------------------------------
            // VALIDACIONES
            // ------------------------------------------------

            if (!nombre || !apellido) {

                throw new Error(
                    "Completá tu nombre y apellido."
                );
            }


            if (!dniValido(dni)) {

                throw new Error(
                    "El DNI ingresado no es válido."
                );
            }


            if (password.length < 8) {

                throw new Error(
                    "La contraseña debe tener al menos 8 caracteres."
                );
            }


            if (password !== confirmarPassword) {

                throw new Error(
                    "Las contraseñas no coinciden."
                );
            }


            if (!tokenValido(token)) {

                throw new Error(
                    "El Token de Seguridad debe tener exactamente 6 números."
                );
            }


            if (token !== confirmarToken) {

                throw new Error(
                    "Los Tokens de Seguridad no coinciden."
                );
            }


            const aceptaTerminos =
                document
                    .getElementById("aceptaTerminos")
                    .checked;

            const aceptaPrivacidad =
                document
                    .getElementById("aceptaPrivacidad")
                    .checked;


            if (
                !aceptaTerminos ||
                !aceptaPrivacidad
            ) {

                throw new Error(
                    "Debés aceptar los términos y la política de privacidad."
                );
            }


            // ------------------------------------------------
            // ARCHIVOS
            // ------------------------------------------------

            const dniFrente =
                document
                    .getElementById("dniFrente")
                    .files[0];

            const dniDorso =
                document
                    .getElementById("dniDorso")
                    .files[0];

            const selfie =
                document
                    .getElementById("selfie")
                    .files[0];


            if (
                !dniFrente ||
                !dniDorso ||
                !selfie
            ) {

                throw new Error(
                    "Debés cargar frente, dorso del DNI y foto de verificación."
                );
            }


            // ------------------------------------------------
            // CREAR USUARIO FIREBASE AUTH
            // ------------------------------------------------

            const resultado =
                await createUserWithEmailAndPassword(
                    auth,
                    email,
                    password
                );


            const user =
                resultado.user;


            // ------------------------------------------------
            // PERFIL AUTH
            // ------------------------------------------------

            await updateProfile(
                user,
                {
                    displayName:
                        `${nombre} ${apellido}`
                }
            );


            // ------------------------------------------------
            // IDENTIFICADORES
            // ------------------------------------------------

            const accountId =
                generarAccountId();

            const alias =
                generarAlias(
                    nombre,
                    apellido
                );


            // ------------------------------------------------
            // CUENTA FIRESTORE
            // ------------------------------------------------
            //
            // IMPORTANTE:
            // NO guardamos contraseña ni Token de Seguridad
            // directamente en Firestore desde el navegador.
            //
            // Para una implementación bancaria real, el token
            // debe almacenarse/validarse mediante backend seguro.
            //
            // En este prototipo guardamos solamente el estado
            // de configuración.
            // ------------------------------------------------

            await setDoc(
                doc(
                    db,
                    "cuentas",
                    user.uid
                ),
                {

                    uid:
                        user.uid,

                    nombre:
                        nombre,

                    apellido:
                        apellido,

                    email:
                        email,

                    telefono:
                        telefono,

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

                    alias:
                        alias,

                    accountId:
                        accountId,

                    saldoCentavos:
                        0,

                    estadoCuenta:
                        "VERIFICACION_PENDIENTE",

                    identidad:
                        {

                            estado:
                                "PENDIENTE",

                            dniFrenteCargado:
                                true,

                            dniDorsoCargado:
                                true,

                            selfieCargada:
                                true
                        },

                    verificaciones:
                        {

                            telefono:
                                "PENDIENTE",

                            email:
                                "VERIFICADO_POR_AUTH"
                        },

                    seguridad:
                        {

                            tokenConfigurado:
                                true
                        },

                    createdAt:
                        serverTimestamp()
                }
            );


            // ------------------------------------------------
            // FINAL
            // ------------------------------------------------

            registroMensaje.textContent =
                "Cuenta creada correctamente.";

            alert(
                "GESBANK: tu cuenta fue creada correctamente."
            );


            await cargarCuenta(user.uid);

            mostrarPanel();


        } catch (error) {

            console.error(
                "Error de registro:",
                error
            );


            let mensaje =
                "No se pudo completar el registro.";


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


                case "permission-denied":

                    mensaje =
                        "Firebase bloqueó el acceso a los datos. Revisá las reglas de Firestore.";

                    break;


                default:

                    if (
                        error.message
                    ) {

                        mensaje =
                            error.message;
                    }
            }


            registroMensaje.textContent =
                mensaje;
        }
    }
);


// ============================================================
// LOGIN
// ============================================================

formLogin.addEventListener(
    "submit",
    async (event) => {

        event.preventDefault();

        loginMensaje.textContent =
            "Ingresando...";


        try {

            const email =
                document
                    .getElementById("loginEmail")
                    .value
                    .trim();

            const password =
                document
                    .getElementById("loginPassword")
                    .value;


            await signInWithEmailAndPassword(
                auth,
                email,
                password
            );


            loginMensaje.textContent =
                "";


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

                    break;


                case "auth/wrong-password":

                    mensaje =
                        "La contraseña es incorrecta.";

                    break;


                case "auth/too-many-requests":

                    mensaje =
                        "Demasiados intentos. Esperá unos minutos.";

                    break;


                default:

                    if (
                        error.message
                    ) {

                        mensaje =
                            error.message;
                    }
            }


            loginMensaje.textContent =
                mensaje;
        }
    }
);


// ============================================================
// CARGAR CUENTA
// ============================================================

async function cargarCuenta(uid) {

    const referencia =
        doc(
            db,
            "cuentas",
            uid
        );


    const resultado =
        await getDoc(
            referencia
        );


    if (!resultado.exists()) {

        console.warn(
            "No existe documento de cuenta."
        );

        return;
    }


    const cuenta =
        resultado.data();


    document
        .getElementById("nombreUsuario")
        .textContent =
            `${cuenta.nombre || ""} ${cuenta.apellido || ""}`;


    document
        .getElementById("accountId")
        .textContent =
            cuenta.accountId || "---";


    document
        .getElementById("aliasCuenta")
        .textContent =
            cuenta.alias || "---";


    document
        .getElementById("emailCuenta")
        .textContent =
            cuenta.email || "---";


    const saldoCentavos =
        Number(
            cuenta.saldoCentavos || 0
        );


    const saldo =
        saldoCentavos / 100;


    document
        .getElementById("saldo")
        .textContent =
            saldo.toLocaleString(
                "es-AR",
                {
                    style: "currency",
                    currency: "ARS"
                }
            );
}


// ============================================================
// CERRAR SESIÓN
// ============================================================

btnCerrarSesion.addEventListener(
    "click",
    async () => {

        try {

            await signOut(auth);

        } catch (error) {

            console.error(
                "Error al cerrar sesión:",
                error
            );
        }
    }
);


// ============================================================
// ESTADO DE AUTENTICACIÓN
// ============================================================

onAuthStateChanged(
    auth,
    async (user) => {

        if (user) {

            try {

                await cargarCuenta(
                    user.uid
                );

                mostrarPanel();

            } catch (error) {

                console.error(
                    "Error cargando cuenta:",
                    error
                );

                mostrarPanel();
            }

        } else {

            mostrarLogin();
        }
    }
);
