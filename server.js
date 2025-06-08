require('dotenv').config();
const express = require('express');
const session = require('express-session');

const path            = require('path');
const dbConnection    = require('./app/utilities/dbh');
const sendGmail       = require('./app/utilities/sendGmail');
const { isBackupScheduled, scheduleBackup, unscheduleBackup } = require('./app/utilities/backup');

const authRouter      = require('./app/routes/authentication');
const dashboardRouter = require('./app/routes/dashboard');
const accountRouter   = require('./app/routes/account');
const companyRouter   = require('./app/routes/settings/company');


// Configs

const app = express();
app.locals.dbConnection = dbConnection;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.set('view engine', 'ejs');
app.set('views', './app/views');

app.use(session({
    secret: process.env.SECRET,
    resave: false,
    saveUninitialized: true,
    cookie: { maxAge: 1000 * 60 * 60  }
}));


// Serve static files
app.use(express.static('public'));
app.use('/public', express.static(path.join(__dirname, 'public')));


// Routes
app.use('/auth', authRouter);
app.use('/dashboard', dashboardRouter);
app.use('/account', accountRouter);
app.use('/parametres/societe', companyRouter);


// Start server
app.listen(process.env.PORT, async () => {
    console.log(`[${new Date().toISOString()}] Paramex backend started. Listening on port http://localhost:${process.env.PORT}...`);

    // Schedule database backup
    try {
        let exists = await isBackupScheduled();
        if(!exists) {
            let code = await scheduleBackup();
            if(code !== 0) throw new Error(`[${new Date().toISOString()}] Schtasks create operation has failed and exited with code ${code}`);
        }

        let code = await unscheduleBackup();
        if(code !== 0) throw new Error(`[${new Date().toISOString()}] Schtasks delete operation has failed and exited wiht code ${code}`);

        code = await scheduleBackup();
        if(code !== 0) throw new Error(`[${new Date().toISOString()}] Schtasks create operation has failed and exited with code ${code}`);
    }
    catch(error) {
        console.error(error);
        process.exit();
    }
});
