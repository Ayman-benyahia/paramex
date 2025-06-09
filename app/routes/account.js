const dbh = require('../utilities/dbh');
const express = require('express');
const router = express.Router();


router.use((req, res, next) => {
    if(!req.session || !req.session.user) { 
        res.redirect('/auth/connexion');
        return;
    }
    next();
});

router.get('/', async (req, res) => {
    let alert = null;
    let employee = null;

    if(req.session.alert) {
        alert = req.session.alert;
        delete req.session.alert;
    }

    try {
        const SQL_FETCH_ADMIN = `SELECT * FROM employee LIMIT 1`;
        const [records] = await dbh.query(SQL_FETCH_ADMIN, []);
        employee = records[0] || null;
    }
    catch(error) {
        console.error(`[${new Date().toISOString()}] Failed to retrieve admin data from the database.`, error);
        res.statusCode = 500;
        res.render('jumbotron', {
            title: '500 Internal Server Error',
            description: 'An unexpected error occurred while loading admin information. Please try again later.',
            backURL: '/dashboard'
        });
        return;
    }

    res.render('account', {
        user: req.session.user,
        alert,
        employee
    });
});

router.post('/', async (req, res) => {
    let { id, fullname, password } = req.body;

    try {
        const SQL_UPDATE_ADMIN_ACCOUNT = `UPDATE employee SET fullname=?, password=? WHERE id = ?`;
        let [ results ] = await dbh.query(SQL_UPDATE_ADMIN_ACCOUNT, [fullname, password, parseInt(id, 10)]);

        req.session.alert = {
            type: 'success', 
            message: 'Account information updated successfully.'
        };

        res.redirect('/account');
    }
    catch(error) {
        console.error(`[${new Date().toISOString()}] Failed to update admin's account information.`, error);
        res.statusCode = 500;
        res.render('jumbotron', {
            title: '500 Internal Server Error',
            description: 'An unexpected error occurred while updating the account. Please try again later.',
            backURL: '/dashboard'
        });
        return;
    }
});

module.exports = router;