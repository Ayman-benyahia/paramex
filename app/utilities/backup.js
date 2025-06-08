const { spawn } = require('child_process');

function isBackupScheduled() {
    return new Promise((resolve, reject) => {
        let handled = false;
        const schtasksQuery = spawn('schtasks', ['/Query', '/TN', process.env.BACKUP_TASKNAME]);

        schtasksQuery.on('exit', (code) => {
            if (handled) return;
            handled = true;
            resolve(code === 0);
        });

        schtasksQuery.on('error', (error) => {
            if (handled) return;
            handled = true;
            resolve(false);
        });
    });
}

function unscheduleBackup() {
    return new Promise((resolve, reject) => {
        let schtasksDelete = spawn(`schtasks`, [
            `/DELETE`, `/TN`, process.env.BACKUP_TASKNAME, '/F'
        ], { shell: true });

        let handled = false;

        schtasksDelete.on('exit', (code) => {
            if(handled) return;
            handled = true;
            resolve(code);
        });

        schtasksDelete.on('error', (error) => {
            if(handled) return;
            handled = true;
            reject(error);
        });
    });
}

function scheduleBackup() {
    return new Promise((resolve, reject) => {
        const {
            BACKUP_EXECUTABLE,
            BACKUP_DESTINATION,
            BACKUP_FREQUENCY,
            BACKUP_PERIOD,
            BACKUP_STARTTIME,
            BACKUP_TASKNAME,
            BACKUP_LOG,
            DB_USER,
            DB_PASSWORD,
            DB_NAME
        } = process.env;

        const MYSQLDUMP_COMMAND = `\"${BACKUP_EXECUTABLE}\" -u ${DB_USER} ${DB_PASSWORD.length > 0 ? `-p${DB_PASSWORD}` : `` } ${DB_NAME} ^> \"${BACKUP_DESTINATION}\" 2^> \"${BACKUP_LOG}\"`;
        const MYSQLDUMP_WRAPPED_COMMAND = `cmd /c \"${MYSQLDUMP_COMMAND}\"`;
        const SCHTASKS_COMMAND_ARGS = [`/Create`, `/TN`, `"${BACKUP_TASKNAME}"`, `/TR`, `\"${MYSQLDUMP_WRAPPED_COMMAND}\"`, `/SC`, BACKUP_FREQUENCY, `/ST`, BACKUP_STARTTIME, `/RI`, BACKUP_PERIOD, `/DU`, `24:00`, `/F` ]
        const schtasksCreate = spawn('schtasks', SCHTASKS_COMMAND_ARGS, { shell: true });

        let handled = false;
        let sqlDumpError = ``;

        schtasksCreate.stderr.on('data', (data) => {
            sqlDumpError += data.toString();
        });

        schtasksCreate.on('exit', (code) => {
            if(handled) return;
            handled = true;

            if(sqlDumpError.trim()) {
                reject(new Error(`Schtask create operation completed but reported: ${sqlDumpError.trim()}`));
                return;
            }

            resolve(code);
        });

        schtasksCreate.on('error', (error) => {
            if (handled) return;
            handled = true;
            reject(error);
        });
    });
}

module.exports = {
    isBackupScheduled,
    unscheduleBackup,
    scheduleBackup
};