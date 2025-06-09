module.exports = {
    fetchAll: (dbh, data) => {
        const { search, page } = data;
        const LIMIT = 20;
        let offset  = page * LIMIT;

        const SQL_FETCH_BONUSES = `
            SELECT * 
            FROM   bonus 
            WHERE  (
                    CAST(due AS CHAR)          LIKE ? OR
                    CAST(auxiliary AS CHAR)    LIKE ? OR
                    CAST(total_amount AS CHAR) LIKE ?
                )
            LIMIT  ?, 20
        `;

        return dbh.query(SQL_FETCH_BONUSES, [ 
            `%${search}%`,
            `%${search}%`,
            `%${search}%`,
            offset 
        ]);
    },

    fetchSingle: (dbh, id) => {
        const SQL_FETCH_BONUS = `SELECT * FROM bonus WHERE id = ?`;
        return dbh.query(SQL_FETCH_BONUS, id);
    },

    insert: (dbh, data) => {
        const {
            due, 
            auxiliary, 
            total_amount
        } = data;

        const SQL_INSERT_BONUS = `
            INSERT INTO bonus (
                due, 
                auxiliary, 
                total_amount
            ) 
            VALUES (
                ?, ?, ?
            )
        `;

        return dbh.query(SQL_INSERT_BONUS, [ 
            due, 
            auxiliary, 
            total_amount 
        ]);
    },

    update: (dbh, data) => {
        const {
            due, 
            auxiliary, 
            total_amount,
            id
        } = data;

        const SQL_UPDATE_BONUS = `
            UPDATE bonus 
            SET    due          = ?, 
                   auxiliary    = ?, 
                   total_amount = ?
            WHERE  id = ?
        `;

        return dbh.query(SQL_UPDATE_BONUS, [ 
            due, 
            auxiliary, 
            total_amount,
            id
        ]);
    },

    delete: (dbh, id) => {
        const SQL_DELETE_BONUS = `DELETE FROM bonus WHERE id = ?`;
        return dbh.query(SQL_DELETE_BONUS, [ id ]);
    }
};