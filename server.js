const express = require("express");
const mysql = require("mysql2/promise");
const cors = require("cors");

const multer = require("multer");
const path = require("path");

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.static(__dirname));

app.use("/img", express.static("img"));



/* =========================
   CONFIGURACIÓN DIRECTA
========================= */
const PORT = process.env.PORT || 3000;

// 🔐 Token simple de administrador
const ADMIN_TOKEN = "sueno_olimpico_admin";

// 🗄️ Datos de Azure MySQL
const dbConfig = {
    host: "sueno.mysql.database.azure.com",
    user: "adminSueno",
    password: "Taekwondo1",
    database: "sueno",
    waitForConnections: true,
    connectionLimit: 10,
    ssl: {
        rejectUnauthorized: false
    }
};


const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, "img");
    },
    filename: (req, file, cb) => {
        const uniqueName =
            Date.now() + "-" + Math.round(Math.random() * 1e9) +
            path.extname(file.originalname);

        cb(null, uniqueName);
    }
});

const upload = multer({ storage });
/* =========================
   CONEXIÓN BD
========================= */
const pool = mysql.createPool(dbConfig);

/* =========================
   MIDDLEWARE ADMIN
========================= */
function adminAuth(req, res, next) {
    const token = req.headers["x-admin-token"];
    if (token !== ADMIN_TOKEN) {
        return res.status(401).json({ error: "No autorizado" });
    }
    next();
}

/* =========================
   RUTAS
========================= */

// Health check
app.get("/", (req, res) => {
    res.json({ status: "API Sueño Olímpico OK" });
});

// Obtener contenido
app.get("/api/contenido/:clave", async (req, res) => {
    try {
        const [rows] = await pool.query(
            "SELECT valor FROM contenidos WHERE clave = ?",
            [req.params.clave]
        );

        if (!rows.length) {
            return res.json({ valor: "" });
        }

        res.json({ valor: rows[0].valor });
    } catch (err) {
        res.status(500).json({ error: "Error del servidor" });
    }
});



// Guardar contenido (admin)
app.post("/api/contenido/:clave", adminAuth, async (req, res) => {
    const { valor } = req.body;

    if (!valor) {
        return res.status(400).json({ error: "Valor requerido" });
    }

    try {
        await pool.query(
            `
            INSERT INTO contenidos (clave, valor)
            VALUES (?, ?)
            ON DUPLICATE KEY UPDATE valor = ?
            `,
            [req.params.clave, valor, valor]
        );

        res.json({ status: "Guardado correctamente" });
    } catch (err) {
        res.status(500).json({ error: "No se pudo guardar" });
    }
});

/* =========================
   INICIAR SERVIDOR
========================= */
app.listen(PORT, () => {
    console.log(`🚀 API Sueño Olímpico corriendo en ${PORT}`);
});


app.get("/api/cinturones/:id", async (req, res) => {
    try {
        const [rows] = await pool.query(
            "SELECT * FROM cinturones_negros WHERE id = ?",
            [req.params.id]
        );

        if (!rows.length) {
            return res.status(404).json({ error: "No encontrado" });
        }

        res.json(rows[0]);
    } catch {
        res.status(500).json({ error: "Error del servidor" });
    }
});

app.get("/api/cinturones", async (req, res) => {
    const [rows] = await pool.query("SELECT id, foto_perfil FROM cinturones_negros");
    res.json(rows);
});


app.post("/api/cinturones/:id", adminAuth, async (req, res) => {
    const { descripcion } = req.body;

    try {
        await pool.query(
            "UPDATE cinturones_negros SET descripcion = ? WHERE id = ?",
            [descripcion, req.params.id]
        );
        res.json({ status: "Actualizado" });
    } catch {
        res.status(500).json({ error: "Error al guardar" });
    }
});

app.put(
    "/api/cinturones/:id",
    upload.fields([
        { name: "foto_perfil", maxCount: 1 },
        { name: "foto", maxCount: 1 }
    ]),
    async (req, res) => {
        console.log("FILES:", req.files);
        console.log("BODY:", req.body);

        try {
            let sql = "UPDATE cinturones_negros SET ";
            const valores = [];
            const campos = [];

            if (req.files?.foto_perfil) {
                const rutaPerfil = `/img/${req.files.foto_perfil[0].filename}`;
                campos.push("foto_perfil = ?");
                valores.push(rutaPerfil);
            }

            if (req.files?.foto) {
                const rutaPortada = `/img/${req.files.foto[0].filename}`;
                campos.push("foto = ?");
                valores.push(rutaPortada);
            }

            if (req.body.descripcion) {
                campos.push("descripcion = ?");
                valores.push(req.body.descripcion);
            }

            if (campos.length === 0) {
                return res.json({ ok: false, mensaje: "Nada para actualizar" });
            }

            sql += campos.join(", ") + " WHERE id = ?";
            valores.push(req.params.id);

            console.log("SQL:", sql);
            console.log("VALORES:", valores);

            await pool.query(sql, valores);

            res.json({ ok: true });

            
        } catch (err) {
            console.error(err);
            res.status(500).json({ ok: false });
        }

        

    }
);


app.post(
    "/api/cinturones",
    upload.fields([
        { name: "foto_perfil", maxCount: 1 },
        { name: "foto", maxCount: 1 }
    ]),
    async (req, res) => {
        try {
            const { nombre, grado, descripcion } = req.body;

            const fotoPerfil = req.files?.foto_perfil
                ? `/img/${req.files.foto_perfil[0].filename}`
                : null;

            const fotoPortada = req.files?.foto
                ? `/img/${req.files.foto[0].filename}`
                : null;

            await pool.query(
                `INSERT INTO cinturones_negros 
                 (nombre, grado, descripcion, foto, foto_perfil)
                 VALUES (?, ?, ?, ?, ?)`,
                [nombre, grado, descripcion, fotoPortada, fotoPerfil]
            );

            res.json({ ok: true });
        } catch (err) {
            res.status(500).json({
                ok: false,
                error: err.message
            });
        }
    }
);

app.get("*", (req, res) => {
    res.sendFile(path.join(__dirname, "index.html"));
});






