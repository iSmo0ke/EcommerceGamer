const express = require('express');
const mysql = require('mysql');
const bcrypt = require('bcrypt');
const bodyParser = require('body-parser');
const cors = require('cors');
const session = require('express-session');
const multer = require('multer');
const path = require('path');


// Crear servidor
const app = express();
const port = 3000;
app.use(cors());


// Middleware
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Conectar a la base de datos MySQL
const db = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '1907',
    //password: '122333',
    database: 'tienda_pc'
});

db.connect((err) => {
    if (err) {
        console.error('Error al conectar a MySQL:', err);
        return;
    }
    console.log('Conectado a MySQL');
});

// Configurar `multer` para almacenar imágenes en la carpeta `uploads/`
const storage = multer.diskStorage({
    destination: 'uploads/',
    filename: (req, file, cb) => {
        cb(null, Date.now() + path.extname(file.originalname)); // Renombrar archivo
    }
});
const upload = multer({ storage });

//Ruta para registro
app.post('/register', (req, res) => {
    console.log('Datos recibidos del cliente:', req.body);

    const { nombre, numero_tel, email, password } = req.body;

    if (!nombre || !numero_tel || !email || !password) {
        console.log('Error: Faltan campos obligatorios');
        return res.status(400).send('Todos los campos son obligatorios');
    }

    bcrypt.hash(password, 10, (err, hash) => {
        if (err) {
            console.error('Error al cifrar la contraseña:', err);
            return res.status(500).send('Error al cifrar la contraseña');
        }

        const query = 'INSERT INTO usuarios (nombre, numero_tel, email, password) VALUES (?, ?, ?, ?)';
        db.query(query, [nombre, numero_tel, email, hash], (err, result) => {
            if (err) {
                console.error('Error al registrar el usuario en la BD:', err);
                return res.status(500).send('Error al registrar el usuario');
            }

            console.log('Usuario registrado exitosamente:', result);
            // Responder al cliente con éxito
            res.status(200).send('Usuario registrado correctamente');
        });
    });

});


//Ruta para login
app.post('/login', (req, res) => {
    const { email, password } = req.body;

    console.log('Solicitud recibida en /login:', req.body);
    if (!email || !password) {
        return res.status(400).send('Todos los campos son obligatorios');
    }
    const query = 'SELECT * FROM usuarios WHERE email = ?';
    db.query(query, [email], (err, results) => {
        if (err) {
            console.error('Error al consultar la base de datos:', err);
            return res.status(500).send('Error en el servidor');
        }

        if (results.length === 0) {
            console.log('Correo no encontrado');
            return res.status(404).send('Correo o contraseña incorrectos');
        }

        const user = results[0];

        // Comparar la contraseña ingresada con la almacenada en la base de datos
        bcrypt.compare(password, user.password, (err, isMatch) => {
            if (err) {
                console.error('Error al comparar contraseñas:', err);
                return res.status(500).send('Error en el servidor');
            }

            if (!isMatch) {
                console.log('Contraseña incorrecta');
                return res.status(401).send('Correo o contraseña incorrectos');
            }

            // Si la autenticación es exitosa
            console.log('Usuario autenticado:', user);
            return res.status(200).json({
                message: 'Inicio de sesión exitoso',
                user: {
                    id: user.id,
                    nombre: user.nombre,
                },
            });
        });
    });
});

// Ruta para agregar productos con imagen
app.post('/agregar', upload.single('imagen'), (req, res) => {
    console.log('Datos recibidos:', req.body);
    console.log('Archivo recibido:', req.file);

    const { nombre, descripcion, precio } = req.body;
    const imagen_url = req.file ? req.file.filename : null; // Guardar solo el nombre del archivo

    if (!nombre || !descripcion || !precio || !imagen_url) {
        return res.status(400).send('Todos los campos son obligatorios');
    }

    const query = 'INSERT INTO productos (nombre, descripcion, precio, imagen_url) VALUES (?, ?, ?, ?)';
    db.query(query, [nombre, descripcion, precio, imagen_url], (err, result) => {
        if (err) {
            console.error('Error al registrar el producto:', err);
            return res.status(500).send('Error al registrar el producto');
        }
        res.status(200).send('Producto registrado correctamente');
    });
});
// Servir archivos estáticos desde la carpeta `uploads`
app.use('/uploads', express.static('uploads'));

//jalar productos
// Endpoint para obtener los productos
app.get('/productos', (req, res) => {
    const query = 'SELECT * FROM productos';
    db.query(query, (err, results) => {
        if (err) {
            console.error('Error al obtener los productos:', err);
            return res.status(500).send('Error al obtener los productos');
        }
        res.status(200).json(results); // Envía los productos al cliente
    });
});

// Iniciar el servidor
app.listen(port, () => {
    console.log(`Servidor escuchando en http://localhost:${port}`);
});
