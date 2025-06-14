const router = require('express').Router();

const repertoireModel = require('../models/repertoire');
const cityModel       = require('../models/city');


router.use((req, res, next) => {
    if(!req.session || !req.session.user) {
        res.redirect('/auth/connexion');
        return;
    }
    next();
});

router.get('/', async (req, res) => {
    let { search, page, trash, archive } = req.query;
    search = search ? search : '';
    page   = page   ? parseInt(page, 10) : 0;

    let alert = null;

    if(req.session.alert) {
        alert = req.session.alert;
        delete req.session.alert;
    }

    try {
        const [clients] = await repertoireModel.fetch({ search, page, trash, archive });
        res.render(`repertoire/entryList`, { 
            baseUrl: new URL(`${req.protocol}://${req.get('host')}${req.originalUrl}`),
            user: req.session.user,
            alert, 
            clients 
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

router.get('/ajoute', async (req, res) => {
    let alert = null;

    if(req.session.alert) {
        alert = req.session.alert;
        delete req.session.alert;
    }    

    try {
        const [cities] = await cityModel.fetchAll();

        res.render('repertoire/addEntry', {
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
        const [result] = await repertoireModel.insert(req.body);

        req.session.alert = {
            type: 'success',
            message: 'The client has been created successfully.'
        };

        if(result.affectedRows === 0) {
            req.session.alert = {
                type: 'warning',
                message: 'The client was not created, please try again.'
            };
        }

        res.redirect('/repertoire/ajoute');
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

router.get('/modifie', async (req, res) => {
    let { id } = req.query;
    let alert  = null;

    if(req.session.alert) {
        alert = req.session.alert;
        delete req.session.alert;
    }    

    try {
        const [cities] = await cityModel.fetchAll();
        const [clients] = await repertoireModel.fetchSingle(id);
        let _client = clients[0] ?? null;

        res.render('repertoire/editEntry', {
            baseUrl: new URL(`${req.protocol}://${req.get('host')}${req.originalUrl}`),
            user: req.session.user,
            alert,
            cities,
            _client
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

router.post('/modifie', async (req, res) => {
    let { id } = req.body;

    try {
        const [result] = await repertoireModel.update(req.body);

        req.session.alert = {
            type: 'success',
            message: 'The client has been updated successfully.'
        };

        if(result.affectedRows === 0) {
            req.session.alert = {
                type: 'warning',
                message: 'The client was not updated, please try again.'
            };
        }

        res.redirect(`/repertoire/modifie?id=${id}`);
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

// router.get('/supprime', async (req, res) => {
//     let { id } = req.query;
//     id = id ? parseInt(id, 10) : -1;

//     try {
//         const [result] = await repertoireModel.delete(id);

//         req.session.alert = {
//             type: 'success',
//             message: 'The client has been deleted successfully.'
//         };

//         if(result.affectedRows === 0) {
//             req.session.alert = {
//                 type: 'warning',
//                 message: 'The client was not deleted, please try again.'
//             };
//         }

//         res.redirect('/repertoire');
//     }
//     catch (error) {
//         if(error.code === 'ER_ROW_IS_REFERENCED_2' || 
//             error.code === 'ER_ROW_IS_REFERENCED')  {
            
//             req.session.alert = {
//                 type: 'danger',
//                 message: 'Cannot delete this city because it is linked to other data. Please remove all related records first.'
//             };

//             res.redirect('/repertoire');
//             return;
//         }

//         res.statusCode = 500;
//         res.render('jumbotron', {
//             title: '500 Internal Server Error',
//             description: '',
//             backUrl: '/dashboard'
//         });
//     }
// });

router.get('/archive', async (req, res) => {
    let { id } = req.query;

    try {
        const [result] = await repertoireModel.archive(id);

        req.session.alert = {
            type: 'success',
            message: 'The client was archived successfully!'
        };

        if(result.affectedRows === 0) {
            req.session.alert = {
                type: 'warning',
                message: 'The client was not archived, Please try again.'
            };
        }

        let baseUrl = new URL(`${req.protocol}://${req.get('host')}${req.originalUrl}`);
        baseUrl.searchParams.delete('id');
        res.redirect(`/repertoire?${baseUrl.searchParams.toString()}`);
    }
    catch(error) {
        res.statusCode = 500;
        res.render('jumbotron', {
            title: '500 Internal Server Error',
            description: '',
            backUrl: '/repertoire'
        });
    }
});

router.get('/desarchiver', async (req, res) => {
    let { id } = req.query;

    try {
        const [result] = await repertoireModel.unarchive(id);

        req.session.alert = {
            type: 'success',
            message: 'The client was restored from archive successfully!'
        };

        if(result.affectedRows === 0) {
            req.session.alert = {
                type: 'warning',
                message: 'The client was not restored from the archive, Please try again.'
            };
        }

        let baseUrl = new URL(`${req.protocol}://${req.get('host')}${req.originalUrl}`);
        baseUrl.searchParams.delete('id');
        res.redirect(`/repertoire?${baseUrl.searchParams.toString()}`);
    }
    catch(error) {
        res.statusCode = 500;
        res.render('jumbotron', {
            title: '500 Internal Server Error',
            description: '',
            backUrl: '/repertoire'
        });
    }
});

router.get('/supprime', async (req, res) => {
    let { id } = req.query;

    try {
        const [result] = await repertoireModel.delete(id);

        req.session.alert = {
            type: 'success',
            message: 'The client was deleted successfully!'
        };

        if(result.affectedRows === 0) {
            req.session.alert = {
                type: 'warning',
                message: 'The client was not deleted, please try again.'
            };
        }

        let baseUrl = new URL(`${req.protocol}://${req.get('host')}${req.originalUrl}`);
        baseUrl.searchParams.delete('id');
        res.redirect(`/repertoire?${baseUrl.searchParams.toString()}`);
    }
    catch(error) {
        if(error.code === 'ER_ROW_IS_REFERENCED_2' || 
           error.code === 'ER_ROW_IS_REFERENCED')  {
            try {
                const [result] = await repertoireModel.dispose(id);

                req.session.alert = {
                    type: 'success',
                    message: 'The client record is sent to trash successfully!'
                };

                if(result.affectedRows === 0) {
                    req.session.alert = {
                        type: 'warning',
                        message: 'The client was not put in the trash, please try again.'
                    };
                }

                let baseUrl = new URL(`${req.protocol}://${req.get('host')}${req.originalUrl}`);
                baseUrl.searchParams.delete('id');
                res.redirect(`/repertoire?${baseUrl.searchParams.toString()}`);
            }
            catch(subError) {
                res.statusCode = 500;
                res.render('jumbotron', {
                    title: '500 Internal Server Error',
                    description: ``,
                    backUrl: '/repertoire'
                });
            }

            return;
        }

        res.statusCode = 500;
        res.render('jumbotron', {
            title: '500 Internal Server Error',
            description: ``,
            backUrl: '/repertoire'
        });
    }
});

router.get('/restaurer', async (req, res) => {
    let { id } = req.query;

    try {
        const [result] = await repertoireModel.restore(id);

        req.session.alert = {
            type: 'success',
            message: 'The client was restored successfully!'
        };

        if(result.affectedRows === 0) {
            req.session.alert = {
                type: 'warning',
                message: 'The client was not restored, Please try again.'
            };
        }

        let baseUrl = new URL(`${req.protocol}://${req.get('host')}${req.originalUrl}`);
        baseUrl.searchParams.delete('id');
        res.redirect(`/repertoire?` + baseUrl.searchParams.toString());
    }
    catch(error) {
        res.statusCode = 500;
        res.render('jumbotron', {
            title: '500 Internal Server Error',
            description: '',
            backUrl: '/repertoire'
        });
    }
});

module.exports = router;