const express = require('express');

let router = express.Router();

router.get('/user', (req, res, next) => {
    res.send('admin-user');
});

module.exports = router;