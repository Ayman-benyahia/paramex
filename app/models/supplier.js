const dbh = require('../utilities/dbh');

module.exports = {
    fetch: (data) => {
        const { search, page, archive, trash } = data;
        const LIMIT  = 20;
        const OFFSET = page * LIMIT;

        const SQL_FETCH_SUPPLIERS = `
            SELECT sup.*, 
                   cit.name AS city, 
                   acc.designation AS accountant
            FROM   supplier AS sup
            JOIN   city AS cit 
            ON     sup.city_id = cit.id
            JOIN   accountant AS acc
            ON     sup.accountant_id = acc.id
            WHERE (
                cit.name        LIKE ? OR
                acc.designation LIKE ? OR
                sup.name        LIKE ? OR
                sup.company_registration_number LIKE ? OR
                sup.phone_1     LIKE ? OR
                sup.phone_2     LIKE ? OR
                sup.address     LIKE ? OR
                sup.email       LIKE ?
            ) 
            AND ( 
                (sup.is_deleted = 0 AND sup.is_archived = 0)
                OR (? = 1 AND sup.is_archived = 1)
                OR (? = 1 AND sup.is_deleted  = 1)
            )
            LIMIT ?, 20
        `;

        return dbh.query(SQL_FETCH_SUPPLIERS, [ 
            `%${search}%`,
            `%${search}%`,
            `%${search}%`,
            `%${search}%`,
            `%${search}%`,
            `%${search}%`,
            `%${search}%`,
            `%${search}%`,
            archive ?? 0,
            trash ?? 0,
            OFFSET
        ]);
    },

    fetchAll: () => {
        const SQL_FETCH_SUPPLIERS = `
            SELECT sup.*, 
                   cit.name AS city, 
                   acc.designation AS accountant
            FROM   supplier AS sup
            JOIN   city AS cit 
            ON     sup.city_id = cit.id
            JOIN   accountant AS acc
            ON     sup.accountant_id = acc.id
            WHERE  (
                sup.is_archived = 0 AND
                sup.is_deleted  = 0 
            )
        `;
        return dbh.query(SQL_FETCH_SUPPLIERS, []);
    },

    fetchSingle: (id) => {
        const SQL_FETCH_SUPPLIER = `
            SELECT sup.*, 
                   cit.name AS city, 
                   acc.designation AS accountant
            FROM   supplier AS sup
            JOIN   city AS cit 
            ON     sup.city_id = cit.id
            JOIN   accountant AS acc
            ON     sup.accountant_id = acc.id
            WHERE  id = ? AND ( 
                sup.is_archived = 0 AND 
                sup.is_deleted  = 0 
            )
        `;
        return dbh.query(SQL_FETCH_SUPPLIER, [ id ]);
    },

    insert: (data) => {
        const {
            accountant_id,
            city_id,
            name,
            company_registration_number,
            phone_1,
            phone_2,
            address,
            email
        } = data;

        const SQL_INSERT_SUPPLIER = `
            INSERT INTO supplier (
                accountant_id,
                city_id,
                name,
                company_registration_number,
                phone_1,
                phone_2,
                address,
                email
            )
            VALUES (
                ?, ?, ?, ?,
                ?, ?, ?, ?
            )
        `;

        return dbh.query(SQL_INSERT_SUPPLIER, [  
            accountant_id,
            city_id,
            name,
            company_registration_number,
            phone_1,
            phone_2,
            address,
            email
        ]);
    },

    update: (data) => {
        const {
            accountant_id,
            city_id,
            name,
            company_registration_number,
            phone_1,
            phone_2,
            address,
            email,
            id
        } = data;

        const SQL_INSERT_SUPPLIER = `
            UPDATE supplier 
            SET    accountant_id = ?,
                   city_id       = ?,
                   name          = ?,
                   company_registration_number = ?,
                   phone_1       = ?,
                   phone_2       = ?,
                   address       = ?,
                   email         = ?
            WHERE  id = ?
        `;

        return dbh.query(SQL_INSERT_SUPPLIER, [  
            accountant_id,
            city_id,
            name,
            company_registration_number,
            phone_1,
            phone_2,
            address,
            email,
            id
        ]);
    },

    delete: (id) => {
        const SQL_DELETE_SUPPLIER = `DELETE FROM supplier WHERE id = ? AND (is_archived = 0 AND is_deleted = 0)`;
        return dbh.query(SQL_DELETE_SUPPLIER, [ id ]);
    },

    dispose: (id) => {
        const SQL_DISPOSE_SUPPLIER = `UPDATE supplier SET is_deleted = 1, deletion_date=CURRENT_TIMESTAMP WHERE id = ?`;
        return dbh.query(SQL_DISPOSE_SUPPLIER, [ id ]);
    },

    restore: (id) => {
        const SQL_DISPOSE_SUPPLIER = `UPDATE supplier SET is_deleted = 0, deletion_date=NULL WHERE id = ?`;
        return dbh.query(SQL_DISPOSE_SUPPLIER, [ id ]);
    },

    archive: (id) => {
        const SQL_ARCHIVE_SUPPLIER = `UPDATE supplier SET is_archived = 1, archive_date=CURRENT_TIMESTAMP WHERE id = ?`;
        return dbh.query(SQL_ARCHIVE_SUPPLIER, [ id ]);
    },

    unarchive: (id) => {
        const SQL_ARCHIVE_SUPPLIER = `UPDATE supplier SET is_archived = 0, archive_date=NULL WHERE id = ?`;
        return dbh.query(SQL_ARCHIVE_SUPPLIER, [ id ]);
    }
};