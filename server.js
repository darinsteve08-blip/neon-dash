const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const cors = require('cors');

const app = express();
const port = 3000;

/* MIDDLEWARES */

app.use(cors());
app.use(express.json());

/* BASE DE DATOS */

const db = new sqlite3.Database('./leaderboard.db', (err) => {
    if (err) {
        console.error("Error DB:", err.message);
    } else {
        console.log('Base de datos conectada.');
    }
});

/* CREAR TABLA */

db.serialize(() => {
    db.run(`
        CREATE TABLE IF NOT EXISTS scores (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            score INTEGER NOT NULL
        )
    `);
});

/* RUTA TEST */

app.get('/', (req, res) => {
    res.send('Servidor activo');
});

/* OBTENER SCORES */

app.get('/getScores', (req, res) => {

    db.all(
        "SELECT name, score FROM scores ORDER BY score DESC LIMIT 10",
        [],
        (err, rows) => {

            if (err) {
                return res.status(500).json({error: err.message});
            }

            res.json({ data: rows });
        }
    );
});

/* GUARDAR SCORE */

app.post('/submitScore', (req, res) => {

    const { name, score } = req.body;

    if (!name || score === undefined) {
        return res.status(400).json({error:'Datos incompletos'});
    }

    db.run(
        "INSERT INTO scores (name, score) VALUES (?, ?)",
        [name, score],
        function(err){

            if(err){
                return res.status(500).json({error:err.message});
            }

            res.json({ success:true });
        }
    );
});

/* ARRANCAR SERVIDOR */

app.listen(port, () => {
    console.log(`🔥 Servidor activo en http://localhost:${port}`);
});
