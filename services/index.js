// routes/index.js
const express = require('express');
const router = express.Router();
const path = require('path');

// Ruta principal
router.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '..', 'public', 'index.html'));
});


router.get('/agregar', (req, res) => {
    res.sendFile(path.join(__dirname, '..', 'public', 'agregar.html'));
});


router.get('/ayuda', (req, res) => {
    res.sendFile(path.join(__dirname, '..', 'public', 'ayuda.html'));
});

router.get('/carrito', (req, res) => {
    res.sendFile(path.join(__dirname, '..', 'public',  'carrito.html'));
});

router.get('/cuenta', (req, res) => {
    res.sendFile(path.join(__dirname, '..', 'public', 'cuenta.html'));
});

router.get('/ofertas', (req, res) => {
    res.sendFile(path.join(__dirname, '..', 'public', 'ofertas.html'));
});

router.get('/productospage', (req, res) => {
    res.sendFile(path.join(__dirname, '..', 'public', 'productos.html'));
});

module.exports = router;