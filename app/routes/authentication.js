const router = require('express').Router();
const { createHash, randomUUID } = require('crypto');
const dbh = require('../utilities/dbh');
const sendGmail = require('../utilities/sendGmail');


router.use('/connexion', (req, res, next) => {
    if(req.session && req.session.user) { 
        res.redirect('/dashboard');
        return;
    }
    next();
});

router.get('/connexion', (req, res) => {
    let alert = null;

    if(req.session.alert) {
        alert = req.session.alert;
        delete req.session.alert;
    }

    res.render('login', {
        alert: alert,
        isLoggedIn: false,
        fullname: '',
        password: ''
    });
});

router.post('/connexion', async (req, res) => {
    const { fullname, password } = req.body;

    let alert = null;
    let employee = null;
    let isLoggedIn = false;

    try {
        const SQL_FETCH_EMPLOYEE_JOINED_ROLES = `
            SELECT     * 
            FROM       employee AS emp 
            INNER JOIN roles    AS rol 
            ON         emp.id   =  rol.employee_id 
            WHERE      fullname =  ?
        `;
        const [records] = await dbh.query(
            SQL_FETCH_EMPLOYEE_JOINED_ROLES, [ fullname ]);

        if(records.length > 0) {
            employee = records[0];
            let hashedPassword = createHash('sha256').update(password).digest('hex');
            if(hashedPassword === employee.password && !alert) { 
                isLoggedIn = true;
                alert = {
                    type: 'success',
                    message: 'You have authenticated successfully! redirecting....'
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
        alert = { 
            type: 'danger', 
            message: "We couldn't complete your request at the moment. Please try again later." 
        };
        return;
    }

    if(isLoggedIn) {
        res.setHeader('Refresh', '3;url=/dashboard');
        req.session.user = {
            id                         : employee.employee_id,
            fullname                   : employee.fullname,
            job_title                  : employee.job_title,
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


router.get('/envoyer_code', async (req, res) => {

    if(req.session.passwordResetCode) {
        delete req.session.passwordResetCode;
    }

    if(req.session.alert) {
        delete req.session.alert;
    }

    try {
        let code = randomUUID();
        req.session.passwordResetCode = code;

        sendGmail({
            username  : process.env.GMAIL_ADRESSE,
            password  : process.env.GMAIL_APP_PASSWORD,
            sender    : process.env.GMAIL_ADRESSE,
            recipient : process.env.GMAIL_ADRESSE,
            subject   : `Paramex - Changer votre mot de passe`,
            html      : `
                <p>Bonjour,</p>
                <p>Pour changer votre mot de passe, veuillez cliquer sur le lien ci-dessous :</p>
                <p>
                    <a href="http://localhost:${process.env.PORT}/auth/changer_passe?code=${code}">
                        Changer mon mot de passe.
                    </a>
                </p>
                <p>Merci,<br>L'équipe Paramex</p>
            `
        }, 
        (info, error) => {
            if(error) throw error;

            req.session.alert = {
                type: 'info',
                message: 'Reset password email has been sent, please open your mailbox.'
            }
            res.redirect('/auth/connexion');
        });
    }
    catch(error) {
        res.statusCode = 500;
        res.render('jumbotron', {
            title : '500 Internal Server Error',
            description : '',
            backUrl : '/auth/connexion'
        });
    }
});

router.get('/changer_passe', async(req, res) => {
    const { code } = req.query;
    let alert = null;

    if(!code) {
        res.redirect('/auth/connexion');
        return;
    }

    if(req.session.alert) {
        alert = req.session.alert;
        delete req.session.alert;
    }

    try {
        res.render('changePassword', { alert, code });
    }
    catch(error) {
        res.statusCode = 500;
        res.render('jumbotron', {
            title : '500 Internal Server Error',
            description : '',
            backUrl : '/auth/connexion'
        });
    }
});

router.post('/changer_passe', async (req, res) => {
    const { code, new_password } = req.body;

    if(!req.session.passwordResetCode || 
        req.session.passwordResetCode !== code) {
    
        req.session.alert = {
            type: 'danger',
            message: 'The Reset password code is invalid, Please try again.'
        };
        res.redirect('/auth/changer_passe');
        return;
    }

    try {
        let hashedPassword = createHash('sha256').update(new_password).digest('hex');
        const SQL_UPDATE_ADMIN_PASSWORD = `UPDATE employee SET password = ? ORDER BY id LIMIT 1`;
        const [result] = await dbh.query(SQL_UPDATE_ADMIN_PASSWORD, [ hashedPassword ]);

        if(result.affectedRows === 0) {
            req.session.alert = {
               type: 'warning',
               message: 'The password was updated, Please try again.'
            };
            res.redirect('/auth/changer_password');
            return;
        }

        req.session.alert = {
            type: 'success',
            message: 'The password was reset with success, Redirecting...'
        };
        res.redirect('/auth/connexion');
    } 
    catch(error) {
        res.render('jumbotron', {
            title : '500 Internal Server Error',
            description : '',
            backUrl : '/auth/connexion'
        });
    }
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
            res.statusCode = 500;
            res.render('jumbotron', {
                title : '500 Internal Server Error',
                description : '',
                backUrl : '/auth/connexion'
            });
            return;
        }

        res.redirect('/auth/connexion');
    });
});


module.exports = router;


