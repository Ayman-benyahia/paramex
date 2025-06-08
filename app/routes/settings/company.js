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
    let alert   = null, 
        company = null;

    if(req.session.alert) {
        alert = req.session.alert;
        delete req.session.alert;
    }

    try {
        const { dbConnection } = req.app.locals;
        const SQL_FETCH_COMPANY_DETAILS = `SELECT * FROM company LIMIT 1`;
        let [ records ] = await dbConnection.query(SQL_FETCH_COMPANY_DETAILS, []);
        if(records.length <= 0) {
            console.error(`[${new Date().toISOString()}] The 'company' table is empty. A company record must be created as one of the initial steps in system configuration.`);
            res.statusCode = 500;
            res.render('jumbotron', {
                title: '500 Internal Server Error',
                description: 'Required system configuration is incomplete. Please contact the administrator to resolve this issue.',
                backURL: '/dashboard'
            });
            return;
        }
        company = records[0];
        res.render('settings/company', {
            user: req.session.user,
            alert,
            company
        });
    }
    catch(error) {
        console.error(`[${new Date().toISOString()}] Failed to fetch company data:`, error);
        res.statusCode = 500;
        res.render('jumbotron', {
            title: '500 Internal Server Error',
            description: 'An error occurred while retrieving necessary information. Please try again later or contact support if the issue continues.',
            backURL: '/dashboard'
        });
    }
});

router.post('/', async (req, res) => {
    const { 
        id,
        name,
        company_registration_number,
        tax_identifier,
        trade_register_number,
        business_license_number,
        phone_1,
        phone_2,
        website,
        address,
        risk_rate,
    } = req.body;

    try {
        const { dbConnection } = req.app.locals;
        const SQL_UPDATE_COMPANY_DETAILS = `
            UPDATE company 
            SET    id                          = ?,
                   name                        = ?,
                   company_registration_number = ?,
                   tax_identifier              = ?,
                   trade_register_number       = ?,
                   business_license_number     = ?,
                   phone_1                     = ?,
                   phone_2                     = ?,
                   website                     = ?,
                   address                     = ?,
                   risk_rate                   = ?
            WHERE  id = ?`;

        const [ results ] = await dbConnection.query(SQL_UPDATE_COMPANY_DETAILS, [
            id,
            name,
            company_registration_number,
            tax_identifier,
            trade_register_number,
            business_license_number,
            phone_1,
            phone_2,
            website,
            address,
            risk_rate,
            id
        ]);

        req.session.alert = {
            type: 'success',
            message: 'Company details has been updated successfully.'
        };

        res.redirect('/parametres/societe');
    }
    catch(error) {
        console.error(`[${new Date().toISOString()}] Failed to update company details in database`, error);
        res.statusCode = 500;
        res.render('jumbotron', {
            title: '500 Internal Server Error',
            description: 'An unexpected issue occurred while saving the company information. Please try again in a moment.',
            backURL: '/dashboard'
        });
    }
});

module.exports = router;