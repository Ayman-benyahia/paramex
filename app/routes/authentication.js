const express = require('express');
const { createHash } = require('crypto');
const sendGmail = require('../utilities/sendGmail');
const router = express.Router();


router.use('/connexion', (req, res, next) => {
    if(req.session && req.session.user) { 
        res.redirect('/dashboard');
        return;
    }
    next();
});

router.get('/connexion', (req, res) => {
    res.render('login', {
        alert: null,
        isLoggedIn: false,
        fullname: '',
        password: ''
    });
});

router.post('/connexion', async (req, res) => {
    const { fullname, password } = req.body;
    let alert = null;
    let isLoggedIn = false;
    let employee = null;

    try {
        const { dbConnection } = req.app.locals;
        const SQL_FETCH_EMPLOYEE_JOINED_ROLES = `
            SELECT     * 
            FROM       employee AS emp 
            INNER JOIN roles    AS rol 
            ON         emp.id   =  rol.employee_id 
            WHERE      fullname = ?
        `;
        const [records] = await dbConnection.query(
            SQL_FETCH_EMPLOYEE_JOINED_ROLES, 
            [ fullname ]
        );

        if(records.length > 0) {
            employee = records[0];
            let hashedPassword = createHash('sha256').update(password).digest('hex');
            if((password === employee.password || hashedPassword === employee.password) && !alert) { 
                isLoggedIn = true;
                alert = {
                    type: 'success',
                    message: 'You have logged-in successfully! redirecting....'
                };
            }
            else if(!alert) {
                alert = {
                    type: 'danger',
                    message: 'Invalid password!'
                };
            }
        }
        else {
            alert = {
                type: 'danger',
                message: 'Account does not exists!'
            };
        }
    }
    catch(error) {
        console.error(`[${new Date().toISOString()}] Error retrieving employee data and roles from the database.`, error);
        alert = { 
            type: 'danger', 
            message: 'We couldn’t complete your request at the moment. Please try again later.' 
        };
        return;
    }

    if(isLoggedIn) {
        res.setHeader('Refresh', '3;url=/dashboard');
        req.session.user = {
            id                         : employee.employee_id,
            fullname                   : employee.fullname,
            position_type              : employee.position_type,
            is_deleted                 : employee.is_deleted, 
            is_archived                : employee.is_archived, 
            deletion_date              : employee.is_deletion_date, 
            archive_date               : employee.is_archive_date,
            can_add_simple_purchase    : employee.can_add_simple_purchase,
            can_modify_simple_purchase : employee.can_modify_simple_purchase,
            can_delete_simple_purchase : employee.can_delete_simple_purchase,
            can_add_delivery           : employee.can_add_delivery,
            can_modify_delivery        : employee.can_modify_delivery,
            can_delete_delivery        : employee.can_delete_delivery,
            can_add_invoice            : employee.can_add_invoice,
            can_modify_invoice         : employee.can_modify_invoice,
            can_delete_invoice         : employee.can_delete_invoice
        };
    }

    res.render('login', {
        alert, 
        isLoggedIn,
        fullname,
        password
    });
});

router.get('/recuperation', async (req, res) => {
    try {
        const { dbConnection } = req.app.locals;
        const SQL_FETCH_EMPLOYEE = `SELECT * FROM employee LIMIT 1`;
        const [ records ] = await dbConnection.query(SQL_FETCH_EMPLOYEE, []);
        var fullname = records[0].fullname;
        var password = records[0].password;
    }
    catch(error) {
        console.error(`[${new Date().toISOString()}] Error retrieving employee data from the database.`, error);
        res.render('jumbotron', {
            title : '500 Internal Server Error',
            description : 'We’re unable to retrieve the necessary information right now.',
            backURL : '/auth/connexion'
        });
        return;
    }

    sendGmail({
        username  : process.env.GMAIL_ADRESSE,
        password  : process.env.GMAIL_APP_PASSWORD,
        sender    : process.env.GMAIL_ADRESSE,
        recipient : process.env.GMAIL_ADRESSE,
        subject   : `Paramex Account's password recovery`,
        text      : `Full Name: ${fullname}\nPassword: ${password}`
    }, 
    (info, error) => {
        if(error) { 
            console.error(`[${new Date().toISOString()}] Email sending failed for "${recipient}":`, error);
            res.render('jumbotron', {
                title : '500 Internal Server Error',
                description : 'Something unusual happened while trying to continue.',
                backURL : '/auth/connexion'
            }); 
            return;
        }
        
        console.log(`[${new Date().toISOString()}] Email dispatched to "${process.env.GMAIL_ADRESSE}" — Message ID: ${info.messageId}`);

        res.render('jumbotron', {
            title : 'Account Recovery',
            description : `An email has been sent to the administrator's address. Please wait a few moments, and if nothing happens, you can <a href="/">retry here</a>`,
            backURL : '/auth/connexion'
        });
    });
});

router.use((req, res, next) => {
    if(!req.session || !req.session.user) { 
        res.redirect('/dashboard');
        return;
    }
    next();
});

router.get('/deconnexion', (req, res) => {
    req.session.destroy((error) => {
        if(error) {
            console.error(`[${new Date().toISOString()}] Failed to destroy session`, error);
            res.statusCode = 500;
            res.render('jumbotron', {
                title : '500 Internal Server Error',
                description : 'We were unable to complete the sign out process.',
                backURL : '/auth/connexion'
            });
            return;
        }
        res.redirect('/auth/connexion');
    });
});


module.exports = router;


