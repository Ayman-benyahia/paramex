const router = require('express').Router();

const accountantModel = require('../models/accountant');


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
        const [accountants] = await accountantModel.fetch({ search, page });
        
        res.render(`settings/accountantEntryList`, { 
            baseUrl: new URL(`${req.protocol}://${req.get('host')}${req.originalUrl}`),
            user: req.session.user,
            alert, 
            accountants 
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

router.post('/ajoute', async (req, res) => {
    try {
        const [result] = await accountantModel.insert(req.body);

        req.session.alert = {
            type: 'success',
            message: 'The accountant has been created successfully!'
        };

        if(result.affectedRows === 0) {
            req.session.alert = {
                type: `warning`,
                message: `The accountant was not created, please try again.`
            };
        }

        res.redirect('/parametres/comptable');
    }
    catch(error) {
        res.statusCode = 500;
        res.render('jumbotron', {
            title: '500 Internal Server Error',
            description: '',
            backUrl: '/parametres/comptable'
        });
    }
});

router.post('/modifie', async (req, res) => {
    try {
        const [result] = await accountantModel.update(req.body);

        req.session.alert = {
            type: 'success',
            message: 'Accountant was updated successfully!'
        };

        if(result.affectedRows === 0) {
            req.session.alert = {
                type: 'warning',
                message: 'Accountant was not updated, please try again.'
            };
        }

        res.redirect(`/parametres/comptable`);
    }
    catch(error) {
        res.statusCode = 500;
        res.render('jumbotron', {
            title: '500 Internal Server Error',
            description: ``,
            backUrl: '/parametres/comptable'
        });
    }
});

router.get('/supprime', async (req, res) => {
    let { id } = req.query;

    try {
        const [result] = await accountantModel.delete(id);

        req.session.alert = {
            type: 'success',
            message: 'Accountant was deleted successfully!'
        };

        if(result.affectedRows === 0) {
            req.session.alert = {
                type: 'warning',
                message: 'Accountant was not deleted, please try again.'
            };
        }

        res.redirect('/parametres/comptable');
    }
    catch(error) {
        if(error.code === 'ER_ROW_IS_REFERENCED_2' || 
           error.code === 'ER_ROW_IS_REFERENCED')  {
            
            req.session.alert = {
                type: 'danger',
                message: 'Cannot delete this accountant because it is linked to other data. Please remove all related records first.'
            };
            res.redirect('/parametres/comptable');
            return;
        }

        res.statusCode = 500;
        res.render('jumbotron', {
            title: '500 Internal Server Error',
            description: ``,
            backUrl: '/parametres/comptable'
        });
    }
});

module.exports = router;