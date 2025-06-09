const express = require('express');
const router = express.Router();
const cityModel = require('../models/employee');


router.use((req, res, next) => {
    if(!req.session || !req.session.user) {
        res.redirect('/auth/connexion');
        return;
    }
    next();
});

router.get('/', async (req, res) => {
    let { search, page } = req.query;
    search = search ? search : '';
    page   = page   ? parseInt(page, 10) : 0;

    let alert = null;

    if(req.session.alert) {
        alert = req.session.alert;
        delete req.session.alert;
    }

    try {
        const [cities] = await cityModel.fetchAll({ search, page });
        res.render(`settings/city/entryList`, { 
            baseUrl: new URL(`${req.protocol}://${req.get('host')}${req.originalUrl}`),
            user: req.session.user,
            alert, 
            cities 
        });
    }
    catch(error) {
        console.error(`[${new Date().toISOString()}] Failed to fetch city list:`, error);
        res.render('jumbotron', {
            title: '500 Internal Server Error',
            mesage: 'An error occurred while trying to load the list of cities. Please try again later.',
            backURL: '/dashboard'
        });
    }
});