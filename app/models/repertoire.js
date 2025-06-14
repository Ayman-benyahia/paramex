const dbh = require('../utilities/dbh');

module.exports = {
    fetch: (data) => {
        const { search, page, archive, trash } = data;
        const LIMIT  = 20;
        const OFFSET = page * LIMIT;

        const SQL_FETCH_CLIENTS = `
            SELECT rep.*, 
                   cit.name AS city
            FROM   repertoire AS rep
            JOIN   city       AS cit
            ON     rep.city_id = cit.id
            WHERE  (
                rep.city_id                      LIKE ? OR
                rep.client_type                  LIKE ? OR
                rep.name                         LIKE ? OR
                rep.company_registration_number  LIKE ? OR
                rep.phone_1                      LIKE ? OR
                rep.phone_1_owner                LIKE ? OR
                rep.phone_2                      LIKE ? OR
                rep.phone_2_owner                LIKE ? OR
                rep.phone_3                      LIKE ? OR
                rep.phone_3_owner                LIKE ? OR
                rep.address                      LIKE ? OR
                rep.comment                      LIKE ? OR
                CAST(rep.purchase_count AS CHAR) LIKE ?
            ) 
            AND ( 
                (rep.is_deleted = 0 AND rep.is_archived = 0)
                OR (? = 1 AND rep.is_archived = 1)
                OR (? = 1 AND rep.is_deleted  = 1)
            )
            LIMIT  ?, 20
        `;

        return dbh.query(SQL_FETCH_CLIENTS, [ 
            `%${search}%`,
            `%${search}%`,
            `%${search}%`,
            `%${search}%`,
            `%${search}%`,
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
        const SQL_FETCH_CLIENTS = `
            SELECT rep.*, 
                   cit.name    AS city
            FROM   repertoire  AS rep
            JOIN   city        AS cit
            ON     rep.city_id =  cit.id 
            WHERE  (
                rep.is_deleted  = 0 AND 
                rep.is_archived = 0
            )
        `;
        return dbh.query(SQL_FETCH_CLIENTS, []);
    },

    fetchSingle: (id) => {
        const SQL_FETCH_CLIENT = `
            SELECT rep.*, 
                   cit.name AS city
            FROM   repertoire AS rep
            JOIN   city       AS cit
            ON     rep.city_id = cit.id
            WHERE  rep.id = ? AND (
                rep.is_deleted  = 0 AND 
                rep.is_archived = 0
            )           
        `;
        return dbh.query(SQL_FETCH_CLIENT, [ id ]);
    },

    insert: (data) => {
        const {
            city_id,
            client_type,
            name,
            company_registration_number,
            phone_1,
            phone_1_owner,
            phone_2,
            phone_2_owner,
            phone_3,
            phone_3_owner,
            address,
            comment,
            purchase_count
        } = data;

        const SQL_INSERT_CLIENT = `
            INSERT INTO repertoire (
                city_id,
                client_type,
                name,
                company_registration_number,
                phone_1,
                phone_1_owner,
                phone_2,
                phone_2_owner,
                phone_3,
                phone_3_owner,
                address,
                comment,
                purchase_count
            )
            VALUES (
                ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?
            )
        `;

        return dbh.query(SQL_INSERT_CLIENT, [  
            city_id,
            client_type,
            name,
            company_registration_number,
            phone_1,
            phone_1_owner,
            phone_2,
            phone_2_owner,
            phone_3,
            phone_3_owner,
            address,
            comment,
            purchase_count
        ]);
    },

    update: (data) => {
        const {
            city_id,
            client_type,
            name,
            company_registration_number,
            phone_1,
            phone_1_owner,
            phone_2,
            phone_2_owner,
            phone_3,
            phone_3_owner,
            address,
            comment,
            purchase_count,
            id
        } = data;

        const SQL_UPDATE_CLIENT = `
            UPDATE repertoire 
            SET    city_id        = ?,
                   client_type    = ?,
                   name           = ?,
                   company_registration_number = ?,
                   phone_1        = ?,
                   phone_1_owner  = ?,
                   phone_2        = ?,
                   phone_2_owner  = ?,
                   phone_3        = ?,
                   phone_3_owner  = ?,
                   address        = ?,
                   comment        = ?,
                   purchase_count = ?
            WHERE  id = ?
        `;

        return dbh.query(SQL_UPDATE_CLIENT, [  
            city_id,
            client_type,
            name,
            company_registration_number,
            phone_1,
            phone_1_owner,
            phone_2,
            phone_2_owner,
            phone_3,
            phone_3_owner,
            address,
            comment,
            purchase_count,
            id
        ]);
    },

    delete: (id) => {
        const SQL_DELETE_CLIENT = `DELETE FROM repertoire WHERE id = ? AND (is_deleted = 0 AND is_archived = 0)`;
        return dbh.query(SQL_DELETE_CLIENT, [ id ]);
    },

    dispose: (id) => {
        const SQL_DISPOSE_CLIENT= `UPDATE repertoire SET is_deleted = 1, deletion_date=CURRENT_TIMESTAMP WHERE id = ?`;
        return dbh.query(SQL_DISPOSE_CLIENT, [ id ]);
    },

    restore: (id) => {
        const SQL_DISPOSE_CLIENT= `UPDATE repertoire SET is_deleted = 0, deletion_date=NULL WHERE id = ?`;
        return dbh.query(SQL_DISPOSE_CLIENT, [ id ]);
    },

    archive: (id) => {
        const SQL_ARCHIVE_CLIENT= `UPDATE repertoire SET is_archived = 1, archive_date=CURRENT_TIMESTAMP WHERE id = ?`;
        return dbh.query(SQL_ARCHIVE_CLIENT, [ id ]);
    },

    unarchive: (id) => {
        const SQL_ARCHIVE_CLIENT= `UPDATE repertoire SET is_archived = 0, archive_date=NULL WHERE id = ?`;
        return dbh.query(SQL_ARCHIVE_CLIENT, [ id ]);
    }
}