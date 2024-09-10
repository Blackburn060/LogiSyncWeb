const express = require('express');
const router = express.Router();

router.get('/healthcheck', (req, res) => {
    res.status(200).json({ status: 'API is up and running!' });
});

router.head('/healthcheck', (req, res) => {
    res.status(200).end();
});

module.exports = router;