const dbh = require('../utilities/dbh');

module.exports = {
    fetch: (data) => {
        const { search, page } = data;
        const LIMIT = 20;
        const OFFSET = page * LIMIT;

        const SQL_FETCH_ACCOUNTANTS = `
            SELECT * 
            FROM accountant 
            WHERE (
                designation                   LIKE ? OR
                code                          LIKE ? OR
                account_classification_number LIKE ?
            ) 
            LIMIT ?, 20
        `;

        return dbh.query(SQL_FETCH_ACCOUNTANTS, [ 
            `%${search}%`,
            `%${search}%`,
            `%${search}%`,
            OFFSET
        ]);
    },

    fetchAll: () => {
        const SQL_FETCH_ACCOUNTANTS = `SELECT * FROM accountant`;
        return dbh.query(SQL_FETCH_ACCOUNTANTS, []);
    },

    fetchSingle: (id) => {
        const SQL_FETCH_ACCOUNTANT = `SELECT * FROM accountant WHERE id = ?`;
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
                   account_classification_number = ?
            WHERE  id = ?
        `;

        return dbh.query(SQL_INSERT_ACCOUNTANT, [  
            designation,
            code,
            account_classification_number,
            id
        ]);
    },

    delete: (id) => {
        const SQL_DELETE_ACCOUNTANT = `DELETE FROM accountant WHERE id = ?`;
        return dbh.query(SQL_DELETE_ACCOUNTANT, [ id ]);
    }
};