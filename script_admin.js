document.addEventListener("DOMContentLoaded", () => {
    const triggerAdmin = document.getElementById("trigger-admin");
    const modalAdmin = document.getElementById("modal-admin");
    const closeBtn = document.querySelector(".cerrar-admin");
    const inputPassword = document.getElementById("admin-password");
    const submitBtn = document.getElementById("admin-submit");
    const btnGuardar = document.getElementById("btn-guardar");

    const ADMIN_PASSWORD = "sueno2026";
    const ADMIN_TOKEN = "sueno_olimpico_admin";

    let modoEdicion = false;
    window.modoEdicion = false;


    const editableElements = {
        quienes: document.getElementById("texto-quienes-somos"),
        objetivo: document.getElementById("texto-objetivo")
    };

    // Cargar textos guardados
    Object.keys(editableElements).forEach(async key => {
        const el = editableElements[key];
        if (!el) return;

        try {
            const res = await fetch(`/api/contenido/${key}`);
            const data = await res.json();
            if (data.valor) el.innerHTML = data.valor;
        } catch {
            el.innerText = "Error al cargar contenido";
        }
    });

    triggerAdmin.addEventListener("dblclick", () => {
        modalAdmin.style.display = "flex";
        inputPassword.value = "";
        inputPassword.focus();
    });

    submitBtn.addEventListener("click", () => {
        if (inputPassword.value === ADMIN_PASSWORD) {
            activarModoEdicion();
            modalAdmin.style.display = "none";
        } else {
            alert("Contraseña incorrecta");
            inputPassword.value = "";
        }
    });

    closeBtn.addEventListener("click", () => {
        modalAdmin.style.display = "none";
    });

    modalAdmin.addEventListener("click", e => {
        if (e.target === modalAdmin) modalAdmin.style.display = "none";
    });

    btnGuardar.addEventListener("click", () => {
        guardarCambios();
        desactivarModoEdicion();
    });

    function activarModoEdicion() {
        modoEdicion = true;
        window.modoEdicion = true;
        btnGuardar.style.display = "block";
        document.getElementById("btn-agregar-logro").style.display = "block";

        Object.values(editableElements).forEach(el => {
            if (!el) return;
            el.setAttribute("contenteditable", "true");
            el.classList.add("modo-edicion");
        });
        document.querySelectorAll(".descripcion-cinturon").forEach(el => {
            el.setAttribute("contenteditable", "true");
            el.classList.add("modo-edicion");
        });

    }

    function desactivarModoEdicion() {
    window.modoEdicion = false;
    document.getElementById("btn-agregar-logro").style.display = "none";
    modoEdicion=false;
    btnGuardar.style.display = "none";

    Object.values(editableElements).forEach(el => {
        if (!el) return;
        el.removeAttribute("contenteditable");
        el.classList.remove("modo-edicion");
    });

    // 🔹 Ocultar panel admin de logros si está abierto
    const panelLogro = document.getElementById("admin-edicion-logro");
    if (panelLogro) {
        panelLogro.style.display = "none";
    }

    alert("Cambios guardados y modo edición desactivado");
}


    async function guardarCambios() {
        for (const key of Object.keys(editableElements)) {
            const el = editableElements[key];
            if (!el) continue;

            await fetch(`/api/contenido/${key}`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "x-admin-token": ADMIN_TOKEN
                },
                body: JSON.stringify({
                    valor: el.innerHTML
                })
            });
        }
        document.querySelectorAll(".descripcion-cinturon").forEach(async el => {
            const id = el.dataset.id;

            await fetch(`/api/cinturones/${id}`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "x-admin-token": ADMIN_TOKEN
                },
                body: JSON.stringify({
                    descripcion: el.innerHTML
                })
            });
        });

    }
});
