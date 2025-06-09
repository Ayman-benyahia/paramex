const dbh = require('../utilities/dbh');

module.exports = {
    fetchAll: (data) => {
        const { search, page } = data;
        const LIMIT  = 20;
        const OFFSET = page * LIMIT;

        const SQL_FETCH_CHEQUES = `
            SELECT che.*, 
                   sup.name AS supplier
            FROM   cheque   AS che
            JOIN   supplier AS sup
            ON     che.supplier_id = sup.id
            WHERE  (
                    sup.name             LIKE ? OR
                    CAST(number AS CHAR) LIKE ? OR
                    CAST(amount AS CHAR) LIKE ? OR
                    issue_date           LIKE ?
                )
            LIMIT  ?, 20
        `;

        return dbh.query(SQL_FETCH_CHEQUES, [ 
            `%${search}%`,
            `%${search}%`,
            `%${search}%`,
            `%${search}%`,
            OFFSET
        ]);
    },

    fetchSingle: (id) => {
        const SQL_FETCH_CHEQUE = `
            SELECT che.*, 
                   sup.name AS supplier
            FROM   cheque   AS che
            JOIN   supplier AS sup
            ON     che.supplier_id = sup.id
            WHERE  id = ?
        `;
        return dbh.query(SQL_FETCH_CHEQUE, id);
    },

    insert: (data) => {
        const {
            supplier_id,
            number,
            amount,
            issue_date,
            is_settled
        } = data;

        const SQL_INSERT_CHEQUE = `
            INSERT INTO cheque (
                supplier_id,
                number,
                amount,
                issue_date,
                is_settled
            ) 
            VALUES (
                ?, ?, ?, ?, ?
            )
        `;

        return dbh.query(SQL_INSERT_CHEQUE, [ 
            supplier_id,
            number,
            amount,
            issue_date,
            is_settled
        ]);
    },

    update: (data) => {
        const {
            supplier_id,
            number,
            amount,
            issue_date,
            is_settled,
            id
        } = data;

        const SQL_UPDATE_CHEQUE = `
            UPDATE cheque 
            SET    supplier_id = ?,
                   number      = ?,
                   amount      = ?,
                   issue_date  = ?,
                   is_settled  = ?
            WHERE  id = ?
        `;

        return dbh.query(SQL_UPDATE_CHEQUE, [ 
            supplier_id,
            number,
            amount,
            issue_date,
            is_settled,
            id
        ]);
    },

    delete: (id) => {
        const SQL_DELETE_CHEQUE = `
            DELETE che
            FROM   cheque   AS che
            JOIN   supplier AS sup
            ON     che.supplier_id = sup.id
            WHERE  che.id = ? AND ( sup.is_deleted = 0 AND sup.is_archived = 0 )
        `;
        return dbh.query(SQL_DELETE_CHEQUE, [ id ]);
    }
};