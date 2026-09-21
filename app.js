import {
    initializeApp
} from "https://www.gstatic.com/firebasejs/12.1.0/firebase-app.js";

import {
    getAuth,
    createUserWithEmailAndPassword,
    signInWithEmailAndPassword,
    signOut,
    onAuthStateChanged,
    updateProfile
} from "https://www.gstatic.com/firebasejs/12.1.0/firebase-auth.js";

import {
    getFirestore,
    collection,
    doc,
    getDoc,
    setDoc,
    addDoc,
    query,
    where,
    orderBy,
    limit,
    getDocs,
    runTransaction,
    serverTimestamp
} from "https://www.gstatic.com/firebasejs/12.1.0/firebase-firestore.js";


/* =========================================================
   FIREBASE
========================================================= */

const firebaseConfig = {

    apiKey:
        "AIzaSyD3BxOZbaaJimSmzc7Ek5t0DOBJTrNWqS0",

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


const app =
    initializeApp(firebaseConfig);

const auth =
    getAuth(app);

const db =
    getFirestore(app);


/* =========================================================
   ELEMENTOS
========================================================= */

const authView =
    document.getElementById("authView");

const bankView =
    document.getElementById("bankView");

const loginTab =
    document.getElementById("loginTab");

const registerTab =
    document.getElementById("registerTab");

const loginForm =
    document.getElementById("loginForm");

const registerForm =
    document.getElementById("registerForm");

const authMessage =
    document.getElementById("authMessage");

const logoutButton =
    document.getElementById("logoutButton");

const userName =
    document.getElementById("userName");

const balance =
    document.getElementById("balance");

const accountAlias =
    document.getElementById("accountAlias");

const accountId =
    document.getElementById("accountId");

const receiveAlias =
    document.getElementById("receiveAlias");

const receiveAccount =
    document.getElementById("receiveAccount");

const operationPanel =
    document.getElementById("operationPanel");

const operationTitle =
    document.getElementById("operationTitle");

const sendForm =
    document.getElementById("sendForm");

const receivePanel =
    document.getElementById("receivePanel");

const payForm =
    document.getElementById("payForm");

const movementsPanel =
    document.getElementById("movementsPanel");

const movementsList =
    document.getElementById("movementsList");

const recentMovements =
    document.getElementById("recentMovements");

const receiptModal =
    document.getElementById("receiptModal");

const receiptContent =
    document.getElementById("receiptContent");

const toast =
    document.getElementById("toast");


/* =========================================================
   ESTADO
========================================================= */

let currentUser = null;

let currentAccount = null;

let balanceVisible = true;


/* =========================================================
   UTILIDADES
========================================================= */

function showMessage(message, error = true) {

    authMessage.textContent = message;

    authMessage.style.color =
        error
            ? "#fca5a5"
            : "#86efac";
}


function showToast(message) {

    toast.textContent = message;

    toast.classList.add("show");

    setTimeout(() => {

        toast.classList.remove("show");

    }, 3000);
}


function formatMoney(cents) {

    const value =
        Number(cents || 0) / 100;

    return value.toLocaleString(
        "es-AR",
        {
            style: "currency",
            currency: "ARS"
        }
    );
}


function normalizeAlias(alias) {

    return alias
        .trim()
        .toLowerCase()
        .replace(/\s+/g, "");
}


function generateAccountId() {

    const random =
        Math.floor(
            10000000 +
            Math.random() * 90000000
        );

    return `GB${random}`;
}


function formatDate(timestamp) {

    if (!timestamp) {
        return "Ahora";
    }

    const date =
        timestamp.toDate
            ? timestamp.toDate()
            : new Date(timestamp);

    return date.toLocaleString(
        "es-AR",
        {
            dateStyle: "short",
            timeStyle: "short"
        }
    );
}


/* =========================================================
   PESTAÑAS
========================================================= */

loginTab.addEventListener(
    "click",
    () => {

        loginTab.classList.add("active");

        registerTab.classList.remove("active");

        loginForm.classList.remove("hidden");

        registerForm.classList.add("hidden");

        showMessage("");

    }
);


registerTab.addEventListener(
    "click",
    () => {

        registerTab.classList.add("active");

        loginTab.classList.remove("active");

        registerForm.classList.remove("hidden");

        loginForm.classList.add("hidden");

        showMessage("");

    }
);


/* =========================================================
   REGISTRO
========================================================= */

registerForm.addEventListener(
    "submit",
    async (event) => {

        event.preventDefault();

        showMessage("");

        const name =
            document
                .getElementById("registerName")
                .value
                .trim();

        const email =
            document
                .getElementById("registerEmail")
                .value
                .trim()
                .toLowerCase();

        const password =
            document
                .getElementById("registerPassword")
                .value;

        const alias =
            normalizeAlias(
                document
                    .getElementById("registerAlias")
                    .value
            );

        if (!name || !email || !password || !alias) {

            showMessage(
                "Completá todos los campos."
            );

            return;
        }


        try {

            const accountQuery =
                query(
                    collection(db, "cuentas"),
                    where("alias", "==", alias),
                    limit(1)
                );

            const accountResult =
                await getDocs(accountQuery);

            if (!accountResult.empty) {

                showMessage(
                    "Ese alias ya está registrado."
                );

                return;
            }


            const credential =
                await createUserWithEmailAndPassword(
                    auth,
                    email,
                    password
                );

            const user =
                credential.user;


            await updateProfile(
                user,
                {
                    displayName: name
                }
            );


            const accountIdValue =
                generateAccountId();


            const accountRef =
                doc(
                    db,
                    "cuentas",
                    user.uid
                );


            currentAccount = {

                uid: user.uid,

                nombre: name,

                email,

                alias,

                accountId:
                    accountIdValue,

                saldoCentavos: 0

            };


            await setDoc(
                accountRef,
                {

                    uid: user.uid,

                    nombre: name,

                    email,

                    alias,

                    accountId:
                        accountIdValue,

                    saldoCentavos: 0,

                    createdAt:
                        serverTimestamp()

                }
            );


            showMessage(
                "Cuenta creada correctamente.",
                false
            );


        } catch (error) {

            console.error(error);

            showMessage(
                firebaseError(error)
            );

        }

    }
);


/* =========================================================
   LOGIN
========================================================= */

loginForm.addEventListener(
    "submit",
    async (event) => {

        event.preventDefault();

        showMessage("");

        const email =
            document
                .getElementById("loginEmail")
                .value
                .trim()
                .toLowerCase();

        const password =
            document
                .getElementById("loginPassword")
                .value;


        try {

            await signInWithEmailAndPassword(
                auth,
                email,
                password
            );

        } catch (error) {

            console.error(error);

            showMessage(
                firebaseError(error)
            );

        }

    }
);


/* =========================================================
   FIREBASE ERRORS
========================================================= */

function firebaseError(error) {

    switch (error.code) {

        case "auth/email-already-in-use":
            return "Ese email ya tiene una cuenta.";

        case "auth/invalid-email":
            return "El email no es válido.";

        case "auth/weak-password":
            return "La contraseña debe tener al menos 6 caracteres.";

        case "auth/invalid-credential":
        case "auth/wrong-password":
        case "auth/user-not-found":
            return "Email o contraseña incorrectos.";

        case "auth/too-many-requests":
            return "Demasiados intentos. Probá nuevamente más tarde.";

        case "permission-denied":
            return "Firebase bloqueó esta operación. Revisá las reglas de Firestore.";

        default:
            return error.message ||
                "Ocurrió un error.";
    }
}


/* =========================================================
   SESIÓN
========================================================= */

onAuthStateChanged(
    auth,
    async (user) => {

        currentUser = user;

        if (!user) {

            authView.classList.remove("hidden");

            bankView.classList.add("hidden");

            currentAccount = null;

            return;
        }


        try {

            await loadAccount();

            authView.classList.add("hidden");

            bankView.classList.remove("hidden");

            await renderBank();

        } catch (error) {

            console.error(error);

            showToast(
                "No se pudo cargar tu cuenta."
            );

        }

    }
);


/* =========================================================
   CARGAR CUENTA
========================================================= */

async function loadAccount() {

    if (!currentUser) {
        return;
    }

    const ref =
        doc(
            db,
            "cuentas",
            currentUser.uid
        );

    const snapshot =
        await getDoc(ref);


    if (!snapshot.exists()) {

        const newAccount = {

            uid: currentUser.uid,

            nombre:
                currentUser.displayName ||
                "Usuario",

            email:
                currentUser.email,

            alias:
                normalizeAlias(
                    (currentUser.displayName ||
                    "usuario") +
                    "." +
                    Math.floor(
                        Math.random() * 10000
                    )
                ),

            accountId:
                generateAccountId(),

            saldoCentavos: 0,

            createdAt:
                serverTimestamp()

        };


        await setDoc(
            ref,
            newAccount
        );


        currentAccount = newAccount;

        return;
    }


    currentAccount = {

        id: snapshot.id,

        ...snapshot.data()

    };
}


/* =========================================================
   RENDER BANCO
========================================================= */

async function renderBank() {

    userName.textContent =
        currentAccount.nombre ||
        currentUser.displayName ||
        "Usuario";


    accountAlias.textContent =
        currentAccount.alias ||
        "-";


    accountId.textContent =
        currentAccount.accountId ||
        "-";


    receiveAlias.textContent =
        currentAccount.alias ||
        "-";


    receiveAccount.textContent =
        currentAccount.accountId ||
        "-";


    updateBalance();

    await loadRecentMovements();

}


/* =========================================================
   SALDO
========================================================= */

function updateBalance() {

    if (!balanceVisible) {

        balance.textContent =
            "••••••";

        return;
    }


    balance.textContent =
        formatMoney(
            currentAccount.saldoCentavos
        );
}


document
    .getElementById("toggleBalance")
    .addEventListener(
        "click",
        () => {

            balanceVisible =
                !balanceVisible;

            updateBalance();

        }
    );


/* =========================================================
   BOTONES DE OPERACIONES
========================================================= */

document
    .querySelectorAll(".action-card")
    .forEach(button => {

        button.addEventListener(
            "click",
            () => {

                openOperation(
                    button.dataset.operation
                );

            }
        );

    });


function hideOperationForms() {

    sendForm.classList.add("hidden");

    receivePanel.classList.add("hidden");

    payForm.classList.add("hidden");

    movementsPanel.classList.add("hidden");
}


async function openOperation(operation) {

    operationPanel.classList.remove("hidden");

    hideOperationForms();


    if (operation === "send") {

        operationTitle.textContent =
            "Enviar dinero";

        sendForm.classList.remove("hidden");

        return;
    }


    if (operation === "receive") {

        operationTitle.textContent =
            "Recibir dinero";

        receivePanel.classList.remove("hidden");

        return;
    }


    if (operation === "pay") {

        operationTitle.textContent =
            "Pagar";

        payForm.classList.remove("hidden");

        return;
    }


    if (operation === "movements") {

        operationTitle.textContent =
            "Movimientos";

        movementsPanel.classList.remove("hidden");

        await loadMovements(
            movementsList,
            50
        );

    }

}


document
    .getElementById("closeOperation")
    .addEventListener(
        "click",
        () => {

            operationPanel.classList.add(
                "hidden"
            );

        }
    );


/* =========================================================
   BUSCAR CUENTA
========================================================= */

async function findAccount(value) {

    const clean =
        value
            .trim()
            .toLowerCase();


    const fields = [
        "alias",
        "email",
        "accountId"
    ];


    for (const field of fields) {

        const q =
            query(
                collection(db, "cuentas"),
                where(field, "==", clean),
                limit(1)
            );

        const result =
            await getDocs(q);

        if (!result.empty) {

            const data =
                result.docs[0].data();

            return {
                id: result.docs[0].id,
                ...data
            };
        }
    }


    return null;
}


/* =========================================================
   ENVIAR DINERO
========================================================= */

sendForm.addEventListener(
    "submit",
    async (event) => {

        event.preventDefault();

        if (!currentUser) {
            return;
        }


        const destination =
            document
                .getElementById(
                    "sendDestination"
                )
                .value
                .trim()
                .toLowerCase();


        const amount =
            Number(
                document
                    .getElementById(
                        "sendAmount"
                    )
                    .value
            );


        const concept =
            document
                .getElementById(
                    "sendConcept"
                )
                .value
                .trim();


        if (!destination || !amount || amount <= 0) {

            showToast(
                "Ingresá un destinatario y un monto válido."
            );

            return;
        }


        const cents =
            Math.round(
                amount * 100
            );


        if (
            cents >
            Number(
                currentAccount.saldoCentavos || 0
            )
        ) {

            showToast(
                "No tenés saldo suficiente."
            );

            return;
        }


        try {

            const recipient =
                await findAccount(
                    destination
                );


            if (!recipient) {

                showToast(
                    "No encontramos esa cuenta."
                );

                return;
            }


            if (
                recipient.uid ===
                currentUser.uid
            ) {

                showToast(
                    "No podés enviarte dinero a vos mismo."
                );

                return;
            }


            const senderRef =
                doc(
                    db,
                    "cuentas",
                    currentUser.uid
                );


            const recipientRef =
                doc(
                    db,
                    "cuentas",
                    recipient.uid
                );


            const movementRef =
                doc(
                    collection(
                        db,
                        "movimientos"
                    )
                );


            await runTransaction(
                db,
                async transaction => {

                    const senderSnap =
                        await transaction.get(
                            senderRef
                        );

                    const recipientSnap =
                        await transaction.get(
                            recipientRef
                        );


                    if (
                        !senderSnap.exists() ||
                        !recipientSnap.exists()
                    ) {

                        throw new Error(
                            "Cuenta inexistente."
                        );
                    }


                    const senderData =
                        senderSnap.data();

                    const recipientData =
                        recipientSnap.data();


                    const senderBalance =
                        Number(
                            senderData.saldoCentavos ||
                            0
                        );


                    if (
                        senderBalance <
                        cents
                    ) {

                        throw new Error(
                            "SALDO_INSUFICIENTE"
                        );
                    }


                    const now =
                        serverTimestamp();


                    transaction.update(
                        senderRef,
                        {
                            saldoCentavos:
                                senderBalance -
                                cents
                        }
                    );


                    transaction.update(
                        recipientRef,
                        {
                            saldoCentavos:
                                Number(
                                    recipientData.saldoCentavos ||
                                    0
                                ) +
                                cents
                        }
                    );


                    transaction.set(
                        movementRef,
                        {

                            tipo: "transferencia",

                            montoCentavos:
                                cents,

                            emisorUid:
                                currentUser.uid,

                            receptorUid:
                                recipient.uid,

                            participantes: [
                                currentUser.uid,
                                recipient.uid
                            ],

                            emisorAlias:
                                currentAccount.alias,

                            receptorAlias:
                                recipient.alias,

                            concepto:
                                concept ||
                                "Transferencia",

                            createdAt:
                                now

                        }
                    );

                }
            );


            await loadAccount();

            updateBalance();

            await loadRecentMovements();


            sendForm.reset();


            showReceipt({

                title:
                    "Transferencia enviada",

                amount:
                    formatMoney(cents),

                destination:
                    recipient.alias,

                concept:
                    concept ||
                    "Transferencia"

            });


        } catch (error) {

            console.error(error);

            if (
                error.message ===
                "SALDO_INSUFICIENTE"
            ) {

                showToast(
                    "No tenés saldo suficiente."
                );

            } else {

                showToast(
                    error.message ||
                    "No se pudo realizar la transferencia."
                );

            }

        }

    }
);


/* =========================================================
   PAGAR
========================================================= */

payForm.addEventListener(
    "submit",
    async (event) => {

        event.preventDefault();

        const destination =
            document
                .getElementById(
                    "payDestination"
                )
                .value
                .trim();


        const amount =
            Number(
                document
                    .getElementById(
                        "payAmount"
                    )
                    .value
            );


        if (!destination || !amount || amount <= 0) {

            showToast(
                "Completá los datos del pago."
            );

            return;
        }


        const cents =
            Math.round(
                amount * 100
            );


        if (
            cents >
            Number(
                currentAccount.saldoCentavos || 0
            )
        ) {

            showToast(
                "No tenés saldo suficiente."
            );

            return;
        }


        try {

            const accountRef =
                doc(
                    db,
                    "cuentas",
                    currentUser.uid
                );


            const movementRef =
                doc(
                    collection(
                        db,
                        "movimientos"
                    )
                );


            await runTransaction(
                db,
                async transaction => {

                    const accountSnap =
                        await transaction.get(
                            accountRef
                        );


                    const account =
                        accountSnap.data();


                    const currentBalance =
                        Number(
                            account.saldoCentavos ||
                            0
                        );


                    if (
                        currentBalance <
                        cents
                    ) {

                        throw new Error(
                            "SALDO_INSUFICIENTE"
                        );
                    }


                    transaction.update(
                        accountRef,
                        {
                            saldoCentavos:
                                currentBalance -
                                cents
                        }
                    );


                    transaction.set(
                        movementRef,
                        {

                            tipo: "pago",

                            montoCentavos:
                                cents,

                            emisorUid:
                                currentUser.uid,

                            receptorUid:
                                null,

                            participantes: [
                                currentUser.uid
                            ],

                            emisorAlias:
                                currentAccount.alias,

                            receptorAlias:
                                destination,

                            concepto:
                                destination,

                            createdAt:
                                serverTimestamp()

                        }
                    );

                }
            );


            await loadAccount();

            updateBalance();

            await loadRecentMovements();


            payForm.reset();


            showReceipt({

                title:
                    "Pago realizado",

                amount:
                    formatMoney(cents),

                destination,

                concept:
                    destination

            });


        } catch (error) {

            console.error(error);

            if (
                error.message ===
                "SALDO_INSUFICIENTE"
            ) {

                showToast(
                    "No tenés saldo suficiente."
                );

            } else {

                showToast(
                    "No se pudo realizar el pago."
                );

            }

        }

    }
);


/* =========================================================
   MOVIMIENTOS
========================================================= */

async function loadRecentMovements() {

    await loadMovements(
        recentMovements,
        5
    );

}


async function loadMovements(
    container,
    maxResults = 20
) {

    if (!currentUser) {
        return;
    }


    container.innerHTML =
        `<div class="empty">
            Cargando movimientos...
        </div>`;


    try {

        const q =
            query(
                collection(
                    db,
                    "movimientos"
                ),

                where(
                    "participantes",
                    "array-contains",
                    currentUser.uid
                ),

                orderBy(
                    "createdAt",
                    "desc"
                ),

                limit(maxResults)
            );


        const result =
            await getDocs(q);


        if (result.empty) {

            container.innerHTML =
                `<div class="empty">
                    Todavía no tenés movimientos.
                </div>`;

            return;
        }


        container.innerHTML = "";


        result.forEach(
            snapshot => {

                const movement =
                    snapshot.data();


                const isIncoming =
                    movement.receptorUid ===
                    currentUser.uid;


                const amount =
                    Number(
                        movement.montoCentavos ||
                        0
                    );


                const div =
                    document.createElement(
                        "div"
                    );


                div.className =
                    "movement";


                let title;

                if (
                    movement.tipo ===
                    "pago"
                ) {

                    title =
                        movement.receptorAlias ||
                        "Pago";

                } else if (
                    isIncoming
                ) {

                    title =
                        `De ${movement.emisorAlias || "Usuario"}`;

                } else {

                    title =
                        `Para ${movement.receptorAlias || "Usuario"}`;
                }


                const sign =
                    isIncoming
                        ? "+"
                        : "-";


                const directionClass =
                    isIncoming
                        ? "in"
                        : "out";


                const icon =
                    isIncoming
                        ? "↓"
                        : "↑";


                div.innerHTML = `

                    <div class="movement-left">

                        <div class="movement-icon">
                            ${icon}
                        </div>

                        <div class="movement-info">

                            <strong>
                                ${escapeHtml(title)}
                            </strong>

                            <small>
                                ${escapeHtml(
                                    movement.concepto ||
                                    movement.tipo ||
                                    "Movimiento"
                                )}
                                ·
                                ${escapeHtml(
                                    formatDate(
                                        movement.createdAt
                                    )
                                )}
                            </small>

                        </div>

                    </div>

                    <div class="movement-amount ${directionClass}">
                        ${sign}${formatMoney(amount)}
                    </div>

                `;


                container.appendChild(
                    div
                );

            }
        );


    } catch (error) {

        console.error(error);

        container.innerHTML =
            `<div class="empty">
                No se pudieron cargar los movimientos.
            </div>`;

    }

}


/* =========================================================
   ESCAPE HTML
========================================================= */

function escapeHtml(value) {

    return String(value || "")
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;")
        .replaceAll("'", "&#039;");
}


/* =========================================================
   COMPROBANTE
========================================================= */

function showReceipt(data) {

    receiptContent.innerHTML = `

        <div class="receipt-row">
            <span>Operación</span>
            <strong>
                ${escapeHtml(data.title)}
            </strong>
        </div>

        <div class="receipt-row">
            <span>Monto</span>
            <strong>
                ${escapeHtml(data.amount)}
            </strong>
        </div>

        <div class="receipt-row">
            <span>Destino</span>
            <strong>
                ${escapeHtml(data.destination)}
            </strong>
        </div>

        <div class="receipt-row">
            <span>Concepto</span>
            <strong>
                ${escapeHtml(data.concept)}
            </strong>
        </div>

        <div class="receipt-row">
            <span>Fecha</span>
            <strong>
                ${escapeHtml(
                    new Date().toLocaleString(
                        "es-AR"
                    )
                )}
            </strong>
        </div>

    `;


    receiptModal.classList.remove(
        "hidden"
    );
}


function closeReceipt() {

    receiptModal.classList.add(
        "hidden"
    );

}


document
    .getElementById("closeReceipt")
    .addEventListener(
        "click",
        closeReceipt
    );


document
    .getElementById("receiptOk")
    .addEventListener(
        "click",
        closeReceipt
    );


/* =========================================================
   COPIAR DATOS
========================================================= */

document
    .getElementById("copyAccount")
    .addEventListener(
        "click",
        async () => {

            const text =
                `GESBANK
Alias: ${currentAccount.alias}
Cuenta: ${currentAccount.accountId}`;


            try {

                await navigator.clipboard.writeText(
                    text
                );

                showToast(
                    "Datos copiados."
                );

            } catch {

                showToast(
                    "No se pudieron copiar los datos."
                );

            }

        }
    );


/* =========================================================
   VER TODOS
========================================================= */

document
    .getElementById("viewAllMovements")
    .addEventListener(
        "click",
        async () => {

            await openOperation(
                "movements"
            );

            operationPanel.scrollIntoView({
                behavior: "smooth"
            });

        }
    );


/* =========================================================
   LOGOUT
========================================================= */

logoutButton.addEventListener(
    "click",
    async () => {

        try {

            await signOut(auth);

        } catch (error) {

            console.error(error);

            showToast(
                "No se pudo cerrar sesión."
            );

        }

    }
);
