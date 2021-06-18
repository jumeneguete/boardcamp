import express from 'express';
import cors from 'cors';
import pg from 'pg';
import joi from 'joi';

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

const userSchema = joi.object({
    name: joi.string().min(1).required(),
    birthday : joi.date().iso(),
    phone: joi.string().pattern(/^[0-9]+$/).min(10).max(11),
    cpf : joi.string().pattern(/^[0-9]+$/).length(11)
  })

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
            const game = await connection.query('SELECT * FROM games WHERE name ILIKE $1', [searchedName]);
            return res.send(game.rows);
        }
        const games = await connection.query('SELECT * FROM  games');
        res.send(games.rows);

    } catch (err){
        console.log(err);
        res.sendStatus(500);
    }
});

app.post('/games', async (req, res) => {
    const { name, image, stockTotal,categoryId, pricePerDay } = req.body;
    const validation = !name || stockTotal<= 0 || pricePerDay <= 0

    try {
        const validCategory = await connection.query('SELECT * FROM categories WHERE id = $1', [categoryId]);
        if (validation || validCategory.rows.length === 0){
            return res.sendStatus(400);
        }

        const existingGame = await connection.query('SELECT * FROM games WHERE name = $1', [name]);
        if (existingGame.rows.length !== 0){
            return res.sendStatus(409);
        }

        await connection.query(`INSERT INTO games (name, image, "stockTotal","categoryId", "pricePerDay") values ($1, $2, $3, $4, $5)`, [name, image, stockTotal,categoryId, pricePerDay ])
        res.sendStatus(201);
    }catch(err){
        console.log(err);
        res.sendStatus(500);
    }
});

//Customers Route
app.get('/customers', async (req, res) => {
    const { cpf } = req.query;
    const searchedCPF = cpf ? `${cpf}%` : "";

    try {
        if (searchedCPF){
            const client = await connection.query('SELECT * FROM customers WHERE name ILIKE $1', [searchedCPF]);
            return res.send(client.rows);
        }
        const customers = await connection.query('SELECT * FROM  customers');
        res.send(customers.rows);

    } catch (err){
        console.log(err);
        res.sendStatus(500);
    }
});

app.get('/customers/:id', async (req, res) => {
    const id  = parseInt(req.params.id);

    try {
        const customer = await connection.query('SELECT * FROM  customers WHERE id = $1', [id]);
        if (customer.rows.length > 0){
            return res.send(customer.rows[0]);
        } else {
            return res.sendStatus(404);
        }

    } catch (err){
        console.log(err);
        res.sendStatus(500);
    }
});

app.post('/customers', async (req, res) => {
    const { name, phone, cpf, birthday } = req.body;

    const validInput = userSchema.validate({ name, phone, cpf, birthday });
    if (!validInput.error) {
        try{
            const existingCpf = await connection.query(`SELECT * FROM customers WHERE cpf = $1`, [cpf]);
            if (existingCpf.rows.length === 0){
                await connection.query(`INSERT INTO customers (name, phone, cpf, birthday )VALUES ($1, $2, $3, $4)`, [name, phone, cpf, birthday]);
                return res.sendStatus(201);
            } else {
                return res.sendStatus(409);
            }          
    
        } catch(err) {
            console.log(err);
            res.sendStatus(500);
        }

    } else {
        return res.sendStatus(400);
    }
});

app.put('/customers/:id', async (req, res) => {
    const id = parseInt(req.params.id);
    const { name, phone, cpf, birthday } = req.body;

    const validInput = userSchema.validate({ name, phone, cpf, birthday });
    if (!validInput.error) {
        try {
            const existingCpf = await connection.query(`SELECT * FROM customers WHERE cpf = $1 AND id <> $2`, [cpf, id]);
            if (existingCpf.rows.length === 0){
                await connection.query(`UPDATE customers SET name = $1, phone = $2, cpf = $3, birthday = $4 WHERE id = $5`, [name, phone, cpf, birthday, id]);
                return res.sendStatus(200);
            } else {
                return res.sendStatus(409);
            }          
    
        } catch(err) {
            console.log(err);
            res.sendStatus(500);
        }
    } else {
        return res.sendStatus(400);
    }
    
});

app.listen(4000, () => {
    console.log('Server is litening on port 4000.');
  });