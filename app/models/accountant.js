const dbh = require('../utilities/dbh');

module.exports = {
    fetchAll: (data) => {
        const { search, page } = data;
        const LIMIT = 20;
        let offset = page * LIMIT;

        const SQL_FETCH_ACCOUNTANTS = `
            SELECT * 
            FROM accountant 
            WHERE (
                designation                   LIKE ? OR
                code                          LIKE ? OR
                account_classification_number LIKE ?
            ) 
            AND (
                is_archived = 0 AND
                is_deleted  = 0 
            )
            LIMIT ?, 20
        `;

        return dbh.query(SQL_FETCH_ACCOUNTANTS, [ 
            `%${search}%`,
            `%${search}%`,
            `%${search}%`,
            offset
        ]);
    },

    fetchSingle: (id) => {
        const SQL_FETCH_ACCOUNTANT = `SELECT * FROM accountant WHERE id = ? AND ( is_archived = 0 AND is_deleted = 0 )`;
        return dbh.query(SQL_FETCH_ACCOUNTANT, [ id ]);
    },

    insert: (data) => {
        const {
            designation,
            code,
            account_classification_number
        } = data;

        const SQL_INSERT_ACCOUNTANT = `
            INSERT INTO accountant (
                designation,
                code,
                account_classification_number
            )
            VALUES (
                ?, ?, ?
            )
        `;

        return dbh.query(SQL_INSERT_ACCOUNTANT, [  
            designation,
            code,
            account_classification_number
        ]);
    },

    update: (data) => {
        const {
            designation,
            code,
            account_classification_number,
            id
        } = data;

        const SQL_INSERT_ACCOUNTANT = `
            UPDATE accountant 
            SET    designation = ?,
                   code        = ?,
                   account_classification_number = ?,
            WHERE  id          = ?
        `;

        return dbh.query(SQL_INSERT_ACCOUNTANT, [  
            designation,
            code,
            account_classification_number,
            id
        ]);
    },

    delete: (id) => {
        const SQL_DELETE_ACCOUNTANT = `DELETE FROM accountant WHERE id = ? AND (is_archived = 1 || is_deleted = 1)`;
        return dbh.query(SQL_DELETE_ACCOUNTANT, [ id ]);
    },

    dispose: (id) => {
        const SQL_DISPOSE_ACCOUNTANT = `UPDATE accountant SET is_deleted = 1, deletion_date=CURRENT_TIMESTAMP WHERE id = ?`;
        return dbh.query(SQL_DISPOSE_ACCOUNTANT, [ id ]);
    },

    restore: (id) => {
        const SQL_DISPOSE_ACCOUNTANT = `UPDATE accountant SET is_deleted = 0, deletion_date=NULL WHERE id = ?`;
        return dbh.query(SQL_DISPOSE_ACCOUNTANT, [ id ]);
    },

    archive: (id) => {
        const SQL_ARCHIVE_ACCOUNTANT = `UPDATE accountant SET is_archived = 1, archive_date=CURRENT_TIMESTAMP WHERE id = ?`;
        return dbh.query(SQL_ARCHIVE_ACCOUNTANT, [ id ]);
    },

    unarchive: (id) => {
        const SQL_ARCHIVE_ACCOUNTANT = `UPDATE accountant SET is_archived = 0, archive_date=NULL WHERE id = ?`;
        return dbh.query(SQL_ARCHIVE_ACCOUNTANT, [ id ]);
    }
};