module.exports = {
    fetchAll: (connection, data) => {
        const { search, page } = data;
        const LIMIT = 20;
        let offset = parseInt(page) * LIMIT;

        const SQL_FETCH_CITIES = `
            SELECT * FROM city WHERE name LIKE ? LIMIT ?, 20
        `;

        return connection.query(SQL_FETCH_CITIES, [ `%${search}%`, offset ]);
    },

    fetchSingle: (connection, id) => {
        const SQL_FETCH_CITY = `SELECT * FROM city WHERE id = ?`;
        return connection.query(SQL_FETCH_CITY, [ id ]);
    },

    insert: (connection, data) => {
        const { name } = data;
        const SQL_INSERT_CITY = `INSERT INTO city (name) VALUES (?)`;
        return connection.query(SQL_INSERT_CITY, [ name ]);
    },

    update: (connection, data) => {
        const { id, name } = data;
        const SQL_UPDATE_CITY = `UPDATE city SET name = ? WHERE id = ?`;
        return connection.query(SQL_UPDATE_CITY, [ name, id ]);
    },

    delete: (connection, id) => {
        const SQL_DELETE_CITY = `DELETE FROM city WHERE id = ?`;
        return connection.query(SQL_DELETE_CITY, [ id ]);
    }
};