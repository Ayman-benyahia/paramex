const express = require('express');
const router = express.Router();

router.use((req, res, next) => {
    if(!req.session || !req.session.user) { 
        res.redirect('/auth/connexion');
        return;
    }
    next();
});

router.get('/', (req, res) => {
    res.render('dashboard', {
        baseUrl: new URL(`${req.protocol}://${req.get('host')}${req.originalUrl}`),    
        user: req.session.user
    });
});

module.exports = router;