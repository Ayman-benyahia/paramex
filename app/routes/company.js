const router = require('express').Router();
const dbh = require('../utilities/dbh');


router.use((req, res, next) => {
    if(!req.session || !req.session.user) { 
        res.redirect('/auth/connexion');
        return;
    }
    next();
});

router.get('/', async (req, res) => {
    let alert   = null;
    let company = null;

    if(req.session.alert) {
        alert = req.session.alert;
        delete req.session.alert;
    }

    try {
        const SQL_FETCH_COMPANY_DETAILS = `SELECT * FROM company LIMIT 1`;
        let [records] = await dbh.query(SQL_FETCH_COMPANY_DETAILS, []);

        if(records.length <= 0) {
            res.statusCode = 500;
            res.render('jumbotron', {
                title: '500 Internal Server Error',
                description: '',
                backUrl: '/dashboard'
            });
            return;
        }

        company = records[0];

        res.render('settings/company', {
            baseUrl: new URL(`${req.protocol}://${req.get('host')}${req.originalUrl}`),
            user: req.session.user,
            alert,
            company
        });
    }
    catch(error) {
        console.log(error);
        res.statusCode = 500;
        res.render('jumbotron', {
            title: '500 Internal Server Error',
            description: '',
            backUrl: '/dashboard'
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

        const [results] = await dbh.query(SQL_UPDATE_COMPANY_DETAILS, [
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
        res.statusCode = 500;
        res.render('jumbotron', {
            title: '500 Internal Server Error',
            description: '',
            backUrl: '/dashboard'
        });
    }
});

module.exports = router;