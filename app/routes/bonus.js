const router = require('express').Router();

const bonusModel = require('../models/bonus');


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
        const [bonuses] = await bonusModel.fetch({ search, page });
        res.render(`settings/bonusEntryList`, { 
            baseUrl: new URL(`${req.protocol}://${req.get('host')}${req.originalUrl}`),
            user: req.session.user,
            alert, 
            bonuses 
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
        const [result] = await bonusModel.insert(req.body);

        req.session.alert = {
            type: 'success',
            message: 'The bonus has been created successfully.'
        };

        if(result.affectedRows === 0) {
            req.session.alert = {
                type: 'warning',
                message: 'The bonus was not created, please try again.'
            };
        }

        res.redirect('/parametres/prime');
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
        const [result] = await bonusModel.update(req.body);

        req.session.alert = {
            type: 'success',
            message: 'The bonus has been updated successfully.'
        };

        if(result.affectedRows === 0) {
            req.session.alert = {
                type: 'warning',
                message: 'The bonus was not updated, please try again.'
            };
        }

        res.redirect('/parametres/prime');
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
        const [result] = await bonusModel.delete(id);

        req.session.alert = {
            type: 'success',
            message: 'The bonus has been deleted successfully.'
        };

        if(result.affectedRows === 0) {
            req.session.alert = {
                type: 'warning',
                message: 'The bonus was not deleted, please try again.'
            };
        }

        res.redirect('/parametres/prime');
    }
    catch (error) {
        if(error.code === 'ER_ROW_IS_REFERENCED_2' || 
            error.code === 'ER_ROW_IS_REFERENCED')  {
            
            req.session.alert = {
                type: 'danger',
                message: 'Cannot delete this bonus because it is linked to other data. Please remove all related records first.'
            };

            res.redirect('/parametres/prime');
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