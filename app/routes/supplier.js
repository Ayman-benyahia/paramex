const router = require('express').Router();

const supplierModel   = require('../models/supplier');
const accountantModel = require('../models/accountant');
const cityModel       = require('../models/city');


router.use((req, res, next) => {
    if(!req.session || !req.session.user) {
        res.redirect('/auth/connexion');
        return;
    }
    next();
});

router.get('/', async (req, res) => {
    let { search, page, archive, trash } = req.query;
    search = search ? search : '';
    page   = page   ? parseInt(page, 10) : 0;

    let alert = null;
    if(req.session.alert) {
        alert = req.session.alert;
        delete req.session.alert;
    }

    try {
        const [cities] = await cityModel.fetchAll();
        const [accountants] = await accountantModel.fetchAll();
        const [suppliers] = await supplierModel.fetch({ search, page, archive, trash });

        res.render(`settings/supplierEntryList`, { 
            baseUrl: new URL(`${req.protocol}://${req.get('host')}${req.originalUrl}`),
            user: req.session.user,
            alert, 
            cities,
            accountants,
            suppliers
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
        const [result] = await supplierModel.insert(req.body);

        req.session.alert = {
            type: 'success',
            message: 'The supplier has been created successfully!'
        };

        if(result.affectedRows === 0) {
            req.session.alert = {
                type: `warning`,
                message: `The supplier was not created, please try again.`
            };
        }

        res.redirect('/parametres/fournisseur');
    }
    catch(error) {
        res.statusCode = 500;
        res.render('jumbotron', {
            title: '500 Internal Server Error',
            description: '',
            backUrl: '/parametres/fournisseur'
        });
    }
});

router.post('/modifie', async (req, res) => {
    try {
        const [result] = await supplierModel.update(req.body);

        req.session.alert = {
            type: 'success',
            message: 'supplier was updated successfully!'
        };

        if(result.affectedRows === 0) {
            req.session.alert = {
                type: 'warning',
                message: 'supplier was not updated, please try again.'
            };
        }

        res.redirect('/parametres/fournisseur');
    }
    catch(error) {
        res.statusCode = 500;
        res.render('jumbotron', {
            title: '500 Internal Server Error',
            description: ``,
            backUrl: '/parametres/fournisseur'
        });
    }
});

// router.get('/supprime', async (req, res) => {
//     let { id } = req.query;

//     try {
//         const [result] = await supplierModel.delete(id);

//         req.session.alert = {
//             type: 'success',
//             message: 'Supplier was deleted successfully!'
//         };

//         if(result.affectedRows === 0) {
//             req.session.alert = {
//                 type: 'warning',
//                 message: 'Supplier was not deleted, please try again.'
//             };
//         }

//         res.redirect('/parametres/fournisseur');
//     }
//     catch(error) {
//         if(error.code === 'ER_ROW_IS_REFERENCED_2' || 
//            error.code === 'ER_ROW_IS_REFERENCED')  {
//             try {
//                 const [result] = await supplierModel.dispose(id);

//                 req.session.alert = {
//                     type: 'success',
//                     message: 'Supplier was deleted successfully!'
//                 };

//                 if(result.affectedRows === 0) {
//                     req.session.alert = {
//                         type: 'warning',
//                         message: 'Supplier was not put in the trash, please try again.'
//                     };
//                 }

//                 res.redirect('/parametres/fournisseur');
//             }
//             catch(subError) {
//                 res.statusCode = 500;
//                 res.render('jumbotron', {
//                     title: '500 Internal Server Error',
//                     description: ``,
//                     backUrl: '/parametres/fournisseur'
//                 });
//             }

//             return;
//         }

//         res.statusCode = 500;
//         res.render('jumbotron', {
//             title: '500 Internal Server Error',
//             description: ``,
//             backUrl: '/parametres/fournisseur'
//         });
//     }
// });


router.get('/archive', async (req, res) => {
    let { id } = req.query;

    try {
        const [result] = await supplierModel.archive(id);

        req.session.alert = {
            type: 'success',
            message: 'The supplier was archived successfully!'
        };

        if(result.affectedRows === 0) {
            req.session.alert = {
                type: 'warning',
                message: 'The supplier was not archived, Please try again.'
            };
        }

        let baseUrl = new URL(`${req.protocol}://${req.get('host')}${req.originalUrl}`);
        baseUrl.searchParams.delete('id');
        res.redirect(`/parametres/fournisseur?${baseUrl.searchParams.toString()}`);
    }
    catch(error) {
        res.statusCode = 500;
        res.render('jumbotron', {
            title: '500 Internal Server Error',
            description: '',
            backUrl: '/parametres/fournisseur'
        });
    }
});

router.get('/desarchiver', async (req, res) => {
    let { id } = req.query;

    try {
        const [result] = await supplierModel.unarchive(id);

        req.session.alert = {
            type: 'success',
            message: 'The supplier was restored from archive successfully!'
        };

        if(result.affectedRows === 0) {
            req.session.alert = {
                type: 'warning',
                message: 'The supplier was not restored from the archive, Please try again.'
            };
        }

        let baseUrl = new URL(`${req.protocol}://${req.get('host')}${req.originalUrl}`);
        baseUrl.searchParams.delete('id');
        res.redirect(`/parametres/fournisseur?${baseUrl.searchParams.toString()}`);
    }
    catch(error) {
        res.statusCode = 500;
        res.render('jumbotron', {
            title: '500 Internal Server Error',
            description: '',
            backUrl: '/parametres/fournisseur'
        });
    }
});

router.get('/supprime', async (req, res) => {
    let { id } = req.query;

    try {
        const [result] = await employeeModel.delete(id);

        req.session.alert = {
            type: 'success',
            message: 'The supplier was deleted successfully!'
        };

        if(result.affectedRows === 0) {
            req.session.alert = {
                type: 'warning',
                message: 'The supplier was not deleted, please try again.'
            };
        }

        let baseUrl = new URL(`${req.protocol}://${req.get('host')}${req.originalUrl}`);
        baseUrl.searchParams.delete('id');
        res.redirect(`/parametres/fournisseur?${baseUrl.searchParams.toString()}`);
    }
    catch(error) {
        if(error.code === 'ER_ROW_IS_REFERENCED_2' || 
           error.code === 'ER_ROW_IS_REFERENCED')  {
            try {
                const [result] = await supplierModel.dispose(id);

                req.session.alert = {
                    type: 'success',
                    message: 'The supplier record is sent to trash successfully!'
                };

                if(result.affectedRows === 0) {
                    req.session.alert = {
                        type: 'warning',
                        message: 'The supplier was not put in the trash, please try again.'
                    };
                }

                let baseUrl = new URL(`${req.protocol}://${req.get('host')}${req.originalUrl}`);
                baseUrl.searchParams.delete('id');
                res.redirect(`/parametres/fournisseur?${baseUrl.searchParams.toString()}`);
            }
            catch(subError) {
                res.statusCode = 500;
                res.render('jumbotron', {
                    title: '500 Internal Server Error',
                    description: ``,
                    backUrl: '/parametres/fournisseur'
                });
            }

            return;
        }

        res.statusCode = 500;
        res.render('jumbotron', {
            title: '500 Internal Server Error',
            description: ``,
            backUrl: '/parametres/fournisseur'
        });
    }
});

router.get('/restaurer', async (req, res) => {
    let { id } = req.query;

    try {
        const [result] = await supplierModel.restore(id);

        req.session.alert = {
            type: 'success',
            message: 'The supplier was restored successfully!'
        };

        if(result.affectedRows === 0) {
            req.session.alert = {
                type: 'warning',
                message: 'The supplier was not restored, Please try again.'
            };
        }

        let baseUrl = new URL(`${req.protocol}://${req.get('host')}${req.originalUrl}`);
        baseUrl.searchParams.delete('id');
        res.redirect(`/parametres/fournisseur?` + baseUrl.searchParams.toString());
    }
    catch(error) {
        res.statusCode = 500;
        res.render('jumbotron', {
            title: '500 Internal Server Error',
            description: '',
            backUrl: '/parametres/fournisseur'
        });
    }
});

module.exports = router;