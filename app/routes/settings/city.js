const express = require('express');
const router = express.Router();
const cityModel = require('../../models/city');


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
        const [cities] = await cityModel.fetchAll(req.app.locals.dbh, { search, page });
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

router.post(`/ajoute`, async (req, res) => {
    try {
        const [result] = await cityModel.insert(req.app.locals.dbh, req.body);

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
        console.error(`[${new Date().toISOString()}] Failed to add new city:`, error);
        res.render('jumbotron', {
            title: '500 Internal Server Error',
            mesage: 'We couldn’t add the new city due to a server error. Please check your input or try again later.',
            backURL: '/dashboard'
        });
    }
});

router.post('/modifie', async (req, res) => {
    try {
        const [result] = await cityModel.update(req.app.locals.dbh, req.body);

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
        console.error(`[${new Date().toISOString()}] Failed to update city with data:`, req.body, error);
        res.render('jumbotron', {
            title: '500 Internal Server Error',
            mesage: 'We couldn’t update the city. The server encountered an issue. Please try again later.',
            backURL: '/dashboard'
        });
    }
});

router.get('/supprime', async (req, res) => {
    let { id } = req.query;
    id = id ? parseInt(id, 10) : -1;

    try {
        const [result] = await cityModel.delete(req.app.locals.dbh, id);

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

        console.error(`[${new Date().toISOString()}] Failed to delete city with ID ${id}:`, error);
        res.render('jumbotron', {
            title: '500 Internal Server Error',
            mesage: 'We couldn’t delete the city due to a server error. Please try again later.',
            backURL: '/dashboard'
        });
    }
});

module.exports = router;