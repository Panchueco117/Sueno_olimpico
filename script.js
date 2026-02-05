async function cargarContenido(clave, elementoId) {
    try {
        const res = await fetch(`/api/contenido/${clave}`);
        const data = await res.json();
        document.getElementById(elementoId).innerHTML = data.valor;
    } catch {
        document.getElementById(elementoId).innerText = "Error al cargar contenido";
    }
}

// Cargar al iniciar
document.addEventListener("DOMContentLoaded", () => {
    cargarContenido("quienes", "texto-quienes-somos");
    cargarContenido("objetivo", "texto-objetivo");
    cargarCinturones();
});

let logroActualId = null;
const modal = document.getElementById("modal-logro");
const cards = document.querySelectorAll(".logro-card");

cards.forEach(card => {
    card.addEventListener("click", async () => {
        const id = card.dataset.id;
        logroActualId = id;

        const res = await fetch(
            `/api/cinturones/${id}`
        );
        const data = await res.json();

        document.getElementById("modal-nombre").textContent = data.nombre;
        document.getElementById("modal-grado").textContent = data.grado;
        document.getElementById("modal-descripcion").innerHTML = data.descripcion;
        document.getElementById("modal-foto").src = data.foto;

        if (window.modoEdicion === true) {
            activarEdicionLogro(data);
        }


        modal.style.display = "flex";
    });
});


document.querySelector(".cerrar").addEventListener("click", () => {
    modal.style.display = "none";
});

modal.addEventListener("click", e => {
    if (e.target === modal) modal.style.display = "none";
});

function activarEdicionLogro(data) {
    const panel = document.getElementById("admin-edicion-logro");
    if (!panel) return;

    panel.style.display = "block";

    // PREVIEWS (imgs, NO inputs)
    const previewPerfil = document.getElementById("preview-foto-card");
    const previewPortada = document.getElementById("preview-foto-modal");
    const inputDesc = document.getElementById("input-descripcion");

    if (previewPerfil) {
        previewPerfil.src = data.foto_perfil || "img/default.png";
    }

    if (previewPortada) {
        previewPortada.src = data.foto || "img/default.png";
    }

    if (inputDesc) {
        inputDesc.value = data.descripcion || "";
    }
}


document.getElementById("guardar-logro").addEventListener("click", async () => {
    const formData = new FormData();

    const inputPerfil = document.getElementById("input-foto-card");
    const inputPortada = document.getElementById("input-foto-modal");
    const inputDesc = document.getElementById("input-descripcion");

    if (inputDesc) {
        formData.append("descripcion", inputDesc.value);
    }

    if (inputPerfil && inputPerfil.files.length > 0) {
        formData.append("foto_perfil", inputPerfil.files[0]);
    }

    if (inputPortada && inputPortada.files.length > 0) {
        formData.append("foto", inputPortada.files[0]);
    }

    const res = await fetch(
        `/api/cinturones/${logroActualId}`,
        {
            method: "PUT",
            body: formData
        }
    );

    const data = await res.json();

    if (!data.ok) {
        alert("Error al guardar");
        return;
    }

    // 🔹 ACTUALIZAR MODAL
    if (data.foto) {
        document.getElementById("modal-foto").src = data.foto + "?t=" + new Date().getTime();
    }

    document.getElementById("modal-descripcion").innerHTML =
        inputDesc.value;

    // 🔹 ACTUALIZAR CARD
    if (data.foto_perfil) {
        const cardImg = document.querySelector(
            `.logro-card[data-id="${logroActualId}"] img`
        );
        if (cardImg) cardImg.src =  payload.foto_card + "?t=" + new Date().getTime();
    }

    alert("Cambios guardados");
});

async function cargarCinturones() {
    const res = await fetch("/api/cinturones");
    const data = await res.json();

    data.forEach(c => {
        const img = document.querySelector(
            `.logro-card[data-id="${c.id}"] img`
        );
        if (img) img.src = c.foto_perfil || "img/default.png";
    });
}

const modalAgregar = document.getElementById("modal-agregar-logro");

document.getElementById("btn-agregar-logro").addEventListener("click", () => {
    modalAgregar.style.display = "flex";
});

modalAgregar.querySelector(".cerrar").addEventListener("click", () => {
    modalAgregar.style.display = "none";
});

document.getElementById("crear-logro").addEventListener("click", async () => {
    const formData = new FormData();

    formData.append("nombre", document.getElementById("nuevo-nombre").value);
    formData.append("grado", document.getElementById("nuevo-grado").value);
    formData.append("descripcion", document.getElementById("nueva-descripcion").value);

    const fotoPerfil = document.getElementById("foto-perfil").files[0];
    const fotoPortada = document.getElementById("foto-portada").files[0];

    if (fotoPerfil) formData.append("foto_perfil", fotoPerfil);
    if (fotoPortada) formData.append("foto", fotoPortada);

    const res = await fetch(`/api/cinturones`, {
        method: "POST",
        body: formData
    });

    const data = await res.json();

    if (data.ok) {
        alert("Cinturón negro agregado");
        document.getElementById("modal-agregar-logro").style.display = "none";
        cargarCinturones(); // recargar cards
    } else {
        alert("Error al guardar");
    }
});

function agregarLogroAlDOM(id, data) {
    const grid = document.querySelector(".logros-grid");

    const div = document.createElement("div");
    div.className = "logro-card";
    div.dataset.id = id;

    div.innerHTML = `
        <img src="${data.foto_perfil}">
        <h3>${data.nombre}</h3>
        <p><strong>${data.grado}</strong></p>
    `;

    grid.appendChild(div);
}

document.getElementById("cancelar-logro").addEventListener("click", () => {
    document.getElementById("modal-agregar-logro").style.display = "none";
});


const galeriaData = {
    entrenamientos: [
        "img/Entrenamientos.png",
        "img/E_diario2.png",
        "img/E_diario3.jpeg",
        "img/Niños.png",
        "img/E_diario17.jpg",
        "img/E_diario18.jpg",
        "img/E_diario19.jpg",
        "img/E_diario20.jpg",
        "img/E_diario5.png",
        "img/E_diario.png",
        "img/Entreno.png",
        "img/diaro4.png",
        "img/E_diario13.jpg",
        "img/E_diario14.jpg",
        "img/E_diario15.jpg",
        "img/E_diario16.jpg",
        "img/E_diario6.jpg",
        "img/E_diario7.jpg",
        "img/E_diario8.jpg",
        "img/E_diario9.jpg",
        "img/E_diario10.jpg",
        "img/E_diario11.jpg",
        "img/E_diario12.jpg"
        
    ],
    competencias: [
        "img/c1.jpg",
        "img/C0.png",
        "img/C01.png",
        "img/c2.png",
        "img/c3.jpg",
        "img/c4.jpg",
        "img/c5.jpg",
        "img/c6.jpg",
        "img/c7.jpg",
        "img/c8.jpg",
        "img/c9.jpg",
        "img/c10.jpg",
        "img/c11.jpg",
        "img/c12.jpg",
        "img/c13.jpg",
        "img/c14.jpg",
        "img/c15.jpg",
        "img/c16.jpg",
        "img/c17.jpg",
        "img/c18.jpg",
        "img/c19.jpg",
        "img/c20.jpg",
        "img/c21.jpg"
        
    ],
    grados: [
        "img/Grados.png",
        "img/Grados2.jpeg",
        "img/g1.jpeg",
        "img/g2.jpeg",
        "img/g3.jpeg",
        "img/g4.jpg",
        "img/g5.jpg",
        "img/g6.jpg",
        "img/g7.jpg",
        "img/g8.png"
    ],
    eventos: [
        "img/e1.jpeg",
        "img/e2.jpeg",
        "img/e3.jpeg",
        "img/e4.png",
        "img/e5.jpg",
        "img/e6.jpg",
        "img/e7.jpg",
        "img/e9.jpg",
        "img/e10.jpg",
        "img/e11.jpg",
        "img/e12.png",
        "img/e13.jpg",
        "img/e14.jpg",
        "img/e15.jpg",
        "img/e16.jpg",
        "img/e17.jpg",
        "img/e18.jpg",
        "img/e19.jpg",
        "img/e20.jpg",
        "img/e21.jpg",
        "img/e22.jpg",
        "img/e23.jpg",
        "img/e23.jpg"
    ],
    momentos: [
        "img/Momentos.png",
        "img/m2.jpg",
        "img/m3.jpg",
        "img/m4.jpg",
        "img/m5.jpg",
        "img/m6.jpg",
        "img/m7.jpg",
        "img/m8.jpg",
        "img/m9.jpg",
        "img/m10.jpg",
        "img/m11.jpg",
        "img/m12.jpg",
        "img/m13.jpg",
        "img/m14.jpg",
        "img/m15.jpg",
        "img/m16.jpg"
    ],
    instalaciones: [
        "momento1.jpg",
        "momento2.jpg"
    ]
};

const modalGaleria = document.getElementById("modal-galeria");
const gridGaleria = document.getElementById("galeria-modal-grid");
const itemsGaleria = document.querySelectorAll(".galeria-item");

itemsGaleria.forEach(item => {
    item.addEventListener("click", () => {
        const key = item.dataset.galeria;
        const fotos = galeriaData[key];
        if (!fotos) return;

        gridGaleria.innerHTML = "";
        fotos.forEach(src => {
            const img = document.createElement("img");
            img.src = src;
            gridGaleria.appendChild(img);
        });

        modalGaleria.style.display = "flex";
    });
});

modalGaleria.querySelector(".cerrar").addEventListener("click", () => {
    modalGaleria.style.display = "none";
});

modalGaleria.addEventListener("click", e => {
    if (e.target === modalGaleria) modalGaleria.style.display = "none";
});

