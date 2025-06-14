const router = require('express').Router();

const chequeModel   = require('../models/cheque');
const supplierModel = require('../models/supplier');


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
        const [suppliers] = await supplierModel.fetchAll();
        const [cheques] = await chequeModel.fetch({ search, page });

        res.render(`settings/chequeEntryList`, { 
            baseUrl: new URL(`${req.protocol}://${req.get('host')}${req.originalUrl}`),
            user: req.session.user,
            alert, 
            suppliers,
            cheques 
        });
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

router.post(`/ajoute`, async (req, res) => {
    try {
        const [result] = await chequeModel.insert(req.body);

        req.session.alert = {
            type: 'success',
            message: 'The cheque has been created successfully.'
        };

        if(result.affectedRows === 0) {
            req.session.alert = {
                type: 'warning',
                message: 'The cheque was not created, please try again.'
            };
        }

        res.redirect('/parametres/cheque');
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

router.post('/modifie', async (req, res) => {
    try {
        const [result] = await chequeModel.update(req.body);

        req.session.alert = {
            type: 'success',
            message: 'The cheque has been updated successfully.'
        };

        if(result.affectedRows === 0) {
            req.session.alert = {
                type: 'warning',
                message: 'The cheque was not updated, please try again.'
            };
        }

        res.redirect('/parametres/cheque');
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

router.get('/supprime', async (req, res) => {
    let { id } = req.query;
    id = id ? parseInt(id, 10) : -1;

    try {
        const [result] = await chequeModel.delete(id);

        req.session.alert = {
            type: 'success',
            message: 'The cheque has been deleted successfully.'
        };

        if(result.affectedRows === 0) {
            req.session.alert = {
                type: 'warning',
                message: 'The cheque was not deleted, please try again.'
            };
        }

        res.redirect('/parametres/cheque');
    }
    catch (error) {
        if(error.code === 'ER_ROW_IS_REFERENCED_2' || 
            error.code === 'ER_ROW_IS_REFERENCED')  {
            
            req.session.alert = {
                type: 'danger',
                message: 'Cannot delete this cheque because it is linked to other data. Please remove all related records first.'
            };

            res.redirect('/parametres/cheque');
            return;
        }
        
        res.statusCode = 500;
        res.render('jumbotron', {
            title: '500 Internal Server Error',
            description: '',
            backUrl: '/dashboard'
        });
    }
});

module.exports = router;