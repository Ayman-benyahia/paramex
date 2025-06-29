const router = require('express').Router();

const cityModel = require('../models/city');


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
        const [cities] = await cityModel.fetch({ search, page });
        res.render(`settings/cityEntryList`, { 
            baseUrl: new URL(`${req.protocol}://${req.get('host')}${req.originalUrl}`),
            user: req.session.user,
            alert, 
            cities 
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
        const [result] = await cityModel.insert(req.body);

        req.session.alert = {
            type: 'success',
            message: 'The city has been created successfully.'
        };

        if(result.affectedRows === 0) {
            req.session.alert = {
                type: 'warning',
                message: 'The city was not created, please try again.'
            };
        }

        res.redirect('/parametres/ville');
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
        const [result] = await cityModel.update(req.body);

        req.session.alert = {
            type: 'success',
            message: 'The city has been updated successfully.'
        };

        if(result.affectedRows === 0) {
            req.session.alert = {
                type: 'warning',
                message: 'The city was not updated, please try again.'
            };
        }

        res.redirect('/parametres/ville');
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
        const [result] = await cityModel.delete(id);

        req.session.alert = {
            type: 'success',
            message: 'The city has been deleted successfully.'
        };

        if(result.affectedRows === 0) {
            req.session.alert = {
                type: 'warning',
                message: 'The city was not deleted, please try again.'
            };
        }

        res.redirect('/parametres/ville');
    }
    catch (error) {
        if(error.code === 'ER_ROW_IS_REFERENCED_2' || 
            error.code === 'ER_ROW_IS_REFERENCED')  {
            
            req.session.alert = {
                type: 'danger',
                message: 'Cannot delete this city because it is linked to other data. Please remove all related records first.'
            };

            res.redirect('/parametres/ville');
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