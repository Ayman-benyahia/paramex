const dbh = require('../utilities/dbh');

module.exports = {
    fetch: (data) => {
        const { search, page } = data;
        const LIMIT = 20;
        let offset = parseInt(page) * LIMIT;

        const SQL_FETCH_CITIES = `SELECT * FROM city WHERE name LIKE ? LIMIT ?, 20`;
        return dbh.query(SQL_FETCH_CITIES, [ `%${search}%`, offset ]);
    },

    fetchAll: () => {
        const SQL_FETCH_CITIES = `SELECT * FROM city`;
        return dbh.query(SQL_FETCH_CITIES, []);
    },

    fetchSingle: (id) => {
        const SQL_FETCH_CITY = `SELECT * FROM city WHERE id = ?`;
        return dbh.query(SQL_FETCH_CITY, [ id ]);
    },

    insert: (data) => {
        const { name } = data;
        const SQL_INSERT_CITY = `INSERT INTO city (name) VALUES (?)`;
        return dbh.query(SQL_INSERT_CITY, [ name ]);
    },

    update: (data) => {
        const { id, name } = data;
        const SQL_UPDATE_CITY = `UPDATE city SET name = ? WHERE id = ?`;
        return dbh.query(SQL_UPDATE_CITY, [ name, id ]);
    },

    delete: (id) => {
        const SQL_DELETE_CITY = `DELETE FROM city WHERE id = ?`;
        return dbh.query(SQL_DELETE_CITY, [ id ]);
    }
};