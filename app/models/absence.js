const dbh = require('../utilities/dbh');

module.exports = {
    fetch: (data) => {
        const { search, page } = data;
        const LIMIT  = 20;
        const OFFSET = page * LIMIT;

        const SQL_FETCH_ABSENCES = `
            SELECT abs.*, 
                   DATE_FORMAT(abs.absence_date, '%d-%m-%Y') AS absence_date,
                   emp.fullname AS employee,
                   emp.is_archived,
                   emp.is_deleted
            FROM   absence  AS abs
            JOIN   employee AS emp
            ON     abs.employee_id = emp.id
            WHERE  (
                emp.fullname LIKE ? OR
                STR_TO_DATE(abs.absence_date, '%d-%m-%Y') LIKE ? OR
                CAST(abs.penalty AS CHAR) LIKE ?
            ) AND (
                emp.is_deleted  = 0 AND 
                emp.is_archived = 0
            ) 
            LIMIT ?, 20
        `;

        return dbh.query(SQL_FETCH_ABSENCES, [ 
            `%${search}%`, 
            `%${search}%`, 
            `%${search}%`,
            OFFSET 
        ]);
    },

    fetchAll: () => { 
        const SQL_FETCH_ABSENCES = `
            SELECT abs.*, 
                   DATE_FORMAT(abs.issue_date, '%d-%m-%Y') AS issue_date,
                   emp.fullname AS employee,
                   emp.is_archived,
                   emp.is_deleted
            FROM   absence  AS abs
            JOIN   employee AS emp
            ON     abs.employee_id = emp.id
        `;
        return dbh.query(SQL_FETCH_ABSENCES, []);
    },

    fetchSingle: (id) => {
        const SQL_FETCH_ABSENCE = `
            SELECT abs.*, 
                   DATE_FORMAT(abs.issue_date, '%d-%m-%Y') AS issue_date,
                   emp.fullname AS employee,
                   emp.is_archived,
                   emp.is_deleted
            FROM   absence  AS abs
            JOIN   employee AS emp
            ON     abs.employee_id = emp.id
            WHERE  id = ? AND (
                emp.is_deleted  = 0 AND 
                emp.is_archived = 0
            ) 
        `;
        return dbh.query(SQL_FETCH_ABSENCE, [ id ]);
    },

    insert: (data) => {
        const {
            employee_id,
            absence_date,
            morning,
            afternoon,
            penalty
        } = data;

        const SQL_INSERT_ABSENCE = `
            INSERT INTO absence (
                employee_id,
                absence_date,
                morning,
                afternoon,
                penalty
            )
            VALUES (
                ?, STR_TO_DATE(?, '%d-%m-%Y'), ?, ?, ?
            )
        `;

        return dbh.query(SQL_INSERT_ABSENCE, [ 
            employee_id,
            absence_date,
            morning ?? 0,
            afternoon ?? 0,
            penalty
        ]);
    },

    update: (data) => {
        const {
            employee_id,
            absence_date,
            morning,
            afternoon,
            penalty,
            id
        } = data;

        const SQL_UPDATE_ABSENCE = `
            UPDATE absence 
            SET    employee_id  = ?,
                   absence_date = STR_TO_DATE(?, '%d-%m-%Y'),
                   morning      = ?,
                   afternoon    = ?,
                   penalty      = ?  
            WHERE  id = ?
        `;

        return dbh.query(SQL_UPDATE_ABSENCE, [ 
            employee_id,
            absence_date,
            morning ?? 0,
            afternoon ?? 0,
            penalty,
            id
        ]);
    },

    delete: (id) => {
        const SQL_DELETE_ABSENCE = `
            DELETE abs 
            FROM   absence  AS abs 
            JOIN   employee AS emp
            ON     abs.employee_id = emp.id
            WHERE  abs.id = ? AND ( emp.is_deleted = 0 AND emp.is_archived = 0 )
        `;
        return dbh.query(SQL_DELETE_ABSENCE, [ id ]);
    }
}