import express from 'express';
import cors from 'cors';
import pg from 'pg';


const { Pool } = pg;

const connection = new Pool({
    user: 'bootcamp_role',
    password: 'senha_super_hiper_ultra_secreta_do_role_do_bootcamp',
    host: 'localhost',
    port: 5432,
    database: 'boardcamp'
});

const app = express();
app.use(cors());
app.use(express.json());

//Categories Route
app.get('/categories', async (req, res) => {
    try {
        const cat = await connection.query('SELECT * FROM  categories');
        res.send(cat.rows);

    } catch (err){
        console.log(err);
        res.sendStatus(500);
    }
});

app.post('/categories', async (req, res) => {
    const { name } = req.body;
    console.log(name)
    if (!name){
        return res.sendStatus(400);
    }
    
    try {
        const existingCat = await connection.query('SELECT * FROM categories WHERE name = $1', [name])
        if (existingCat){
            return res.sendStatus(409);
        }
        await connection.query('INSERT INTO categories (name) VALUES ($1)', [name]);
        res.sendStatus(201);
        
    } catch(err){
        console.log(err);
        res.sendStatus(500);
    }
});

//Games Route
app.get('/games', async (req, res) => {
    const { name } = req.query;
    const searchedName = name ? `${name}%` : "";

    try {
        if (searchedName){
            const game = await connection.query('SELECT * FROM games WHERE name LIKE $1', [searchedName]);
            return res.send(game.rows);
        }
        const games = await connection.query('SELECT * FROM  games');
        res.send(games.rows);

    } catch (err){
        console.log(err);
        res.sendStatus(500);
    }
});


app.listen(4000, () => {
    console.log('Server is litening on port 4000.');
  });