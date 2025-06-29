const router = require('express').Router();
const { createHash } = require('crypto');
const employeeModel = require('../models/employee');
const cityModel     = require('../models/city');


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
        const [employees] = await employeeModel.fetch({ search, page, archive, trash });
        res.render(`settings/employee/entryList`, { 
            baseUrl: new URL(`${req.protocol}://${req.get('host')}${req.originalUrl}`),
            user: req.session.user,
            alert, 
            employees 
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
    let alert  = null;

    if(req.session.alert) {
        alert = req.session.alert;
        delete req.session.alert;
    }

    try { 
        const [cities] = await cityModel.fetchAll();
        res.render('settings/employee/addEntry', {
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
            backUrl: '/parametres/personnel'
        });
    }
});

router.post('/ajoute', async (req, res) => {
    const { password } = req.body;
    try {
        req.body.password = createHash('sha256').update(password).digest('hex');
        console.log(req.body.password);
        const result = await employeeModel.insert(req.body);

        req.session.alert = {
            type: 'success',
            message: 'The employee has been created successfully!'
        };

        if(result.affectedRows === 0) {
            req.session.alert = {
                type: `warning`,
                message: `The employee was not created, please try again.`
            };
        }

        res.redirect('/parametres/personnel/ajoute');
    }
    catch(error) {
        res.statusCode = 500;
        res.render('jumbotron', {
            title: '500 Internal Server Error',
            description: '',
            backUrl: '/parametres/personnel'
        });
    }
});

router.get('/modifie', async (req, res) => {
    let cities = [],
        employee = null,
        alert = null;

    if(req.session.alert) {
        alert = req.session.alert;
        delete req.session.alert;
    }

    try { 
        const [cityRecords] = await cityModel.fetchAll(); 
        const [employeeRecords] = await employeeModel.fetchSingle(req.query.id);
        cities = cityRecords;
        employee = employeeRecords[0] ?? null;
    }
    catch(error) {
        res.statusCode = 500;
        res.render('jumbotron', {
            title: '500 Internal Server Error',
            description: '',
            backUrl: '/parametres/personnel'
        });
        return;
    }

    res.render('settings/employee/editEntry', {
        baseUrl: new URL(`${req.protocol}://${req.get('host')}${req.originalUrl}`),
        user: req.session.user,
        alert,
        cities,
        employee
    });
});

router.post('/modifie', async (req, res) => {
    const { id, password } =  req.body;

    try {
        req.body.password = createHash('sha256').update(password).digest('hex');
        const [result] = await employeeModel.update(req.body);

        req.session.alert = {
            type: 'success',
            message: 'Employee was updated successfully!'
        };

        if(result.affectedRows === 0) {
            req.session.alert = {
                type: 'warning',
                message: 'Employee was not updated, please try again.'
            };
        }

        res.redirect(`/parametres/personnel/modifie?id=${id}`);
    }
    catch(error) {
        res.statusCode = 500;
        res.render('jumbotron', {
            title: '500 Internal Server Error',
            description: ``,
            backUrl: '/parametres/personnel'
        });
    }
});

router.post('/modifie/roles', async (req, res) => {
    const { employee_id } = req.body;

    try {
        const [result] = await employeeModel.updateRoles(req.body);
        
        req.session.alert = {
            type: 'success',
            message: 'Roles were updated successfully!'
        };

        if(result.affectedRows === 0) {
            req.session.alert = {
                type: 'warning',
                message: 'Roles were not updated, Please try again.'
            };
        }

        res.redirect(`/parametres/personnel/modifie?id=${employee_id}`);
    }
    catch(error) {
        res.statusCode = 500;
        res.render('jumbotron', {
            title: '500 Internal Server Error',
            description: '',
            backUrl: '/parametres/personnel'
        });
    }
});

router.get('/archive', async (req, res) => {
    let { id } = req.query;

    try {
        const [result] = await employeeModel.archive(id);

        req.session.alert = {
            type: 'success',
            message: 'The employee was archived successfully!'
        };

        if(result.affectedRows === 0) {
            req.session.alert = {
                type: 'warning',
                message: 'The employee was not archived, Please try again.'
            };
        }

        let baseUrl = new URL(`${req.protocol}://${req.get('host')}${req.originalUrl}`);
        baseUrl.searchParams.delete('id');
        res.redirect(`/parametres/personnel?${baseUrl.searchParams.toString()}`);
    }
    catch(error) {
        res.statusCode = 500;
        res.render('jumbotron', {
            title: '500 Internal Server Error',
            description: '',
            backUrl: '/parametres/personnel'
        });
    }
});

router.get('/desarchiver', async (req, res) => {
    let { id } = req.query;

    try {
        const [result] = await employeeModel.unarchive(id);

        req.session.alert = {
            type: 'success',
            message: 'The employee was restored from archive successfully!'
        };

        if(result.affectedRows === 0) {
            req.session.alert = {
                type: 'warning',
                message: 'The employee was not restored from the archive, Please try again.'
            };
        }

        let baseUrl = new URL(`${req.protocol}://${req.get('host')}${req.originalUrl}`);
        baseUrl.searchParams.delete('id');
        res.redirect(`/parametres/personnel?${baseUrl.searchParams.toString()}`);
    }
    catch(error) {
        res.statusCode = 500;
        res.render('jumbotron', {
            title: '500 Internal Server Error',
            description: '',
            backUrl: '/parametres/personnel'
        });
    }
});

router.get('/supprime', async (req, res) => {
    let { id } = req.query;

    try {
        const [result] = await employeeModel.delete(id);

        req.session.alert = {
            type: 'success',
            message: 'Employee was deleted successfully!'
        };

        if(result.affectedRows === 0) {
            req.session.alert = {
                type: 'warning',
                message: 'Employee was not deleted, please try again.'
            };
        }

        let baseUrl = new URL(`${req.protocol}://${req.get('host')}${req.originalUrl}`);
        baseUrl.searchParams.delete('id');
        res.redirect(`/parametres/personnel?${baseUrl.searchParams.toString()}`);
    }
    catch(error) {
        if(error.code === 'ER_ROW_IS_REFERENCED_2' || 
           error.code === 'ER_ROW_IS_REFERENCED')  {
            try {
                const [result] = await employeeModel.dispose(id);

                req.session.alert = {
                    type: 'success',
                    message: 'Employee record is sent to trash successfully!'
                };

                if(result.affectedRows === 0) {
                    req.session.alert = {
                        type: 'warning',
                        message: 'Employee was not put in the trash, please try again.'
                    };
                }

                let baseUrl = new URL(`${req.protocol}://${req.get('host')}${req.originalUrl}`);
                baseUrl.searchParams.delete('id');
                res.redirect(`/parametres/personnel?${baseUrl.searchParams.toString()}`);
            }
            catch(subError) {
                res.statusCode = 500;
                res.render('jumbotron', {
                    title: '500 Internal Server Error',
                    description: ``,
                    backUrl: '/parametres/personnel'
                });
            }

            return;
        }

        res.statusCode = 500;
        res.render('jumbotron', {
            title: '500 Internal Server Error',
            description: ``,
            backUrl: '/parametres/personnel'
        });
    }
});

router.get('/restaurer', async (req, res) => {
    let { id } = req.query;

    try {
        const [result] = await employeeModel.restore(id);

        req.session.alert = {
            type: 'success',
            message: 'The employee was restored successfully!'
        };

        if(result.affectedRows === 0) {
            req.session.alert = {
                type: 'warning',
                message: 'The employee was not restored, Please try again.'
            };
        }

        let baseUrl = new URL(`${req.protocol}://${req.get('host')}${req.originalUrl}`);
        baseUrl.searchParams.delete('id');
        res.redirect(`/parametres/personnel?` + baseUrl.searchParams.toString());
    }
    catch(error) {
        res.statusCode = 500;
        res.render('jumbotron', {
            title: '500 Internal Server Error',
            description: '',
            backUrl: '/parametres/personnel'
        });
    }
});

module.exports = router;