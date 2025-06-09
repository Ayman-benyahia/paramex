const dbh = require('../utilities/dbh');

module.exports = {
    fetchAll: (data) => {
        const { search, page } = data;
        const LIMIT = 20;
        let offset = page * LIMIT;

        const SQL_FETCH_EMPLOYEES = `
            SELECT emp.*, 
                   cit.name AS city
            FROM   employee AS emp
            JOIN   city     AS cit
            ON     emp.city_id = cit.id
            WHERE  (
                cit.name  LIKE ?  OR
                fullname  LIKE ?  OR
                job_title LIKE ?  OR
                password  LIKE ?  OR
                phone_1   LIKE ?  OR
                phone_2   LIKE ?  OR
                address   LIKE ?  OR
                CAST(salary AS CHAR) LIKE ?  OR
                hire_date LIKE ?
            ) AND (
                is_deleted  = 0 AND 
                is_archived = 0
            )
            LIMIT  ?, 20
        `;

        return dbh.query(
            SQL_FETCH_EMPLOYEES, [
                `%${search}%`,
                `%${search}%`,
                `%${search}%`,
                `%${search}%`,
                `%${search}%`,
                `%${search}%`,
                `%${search}%`,
                `%${search}%`,
                `%${search}%`,
                offset
            ]
        );
    },

    fetchSingle: (id) => {
        const SQL_FETCH_EMPLOYEE = `
            SELECT emp.*, 
                   cit.name AS city
            FROM   employee AS emp 
            JOIN   city     AS cit
            ON     emp.city_id = cit.id
            WHERE  id = ? AND is_deleted = 0 AND is_archived = 0
        `;
        return dbh.query(SQL_FETCH_EMPLOYEE, [ id ]);
    },

    insert: async (data) => {
        const {
            city_id,  fullname, job_title,
            password, phone_1,  phone_2,
            address,  salary,   hire_date
        } = data;

        let result = null;
        const connection = await dbh.getConnection();

        try {
            await connection.beginTransaction();

            const SQL_INSERT_EMPLOYEE = `
                INSERT INTO employee (
                    city_id,  fullname, job_title, 
                    password, phone_1,  phone_2, 
                    address,  salary,   hire_date
                ) 
                VALUES (
                    ?, ?, ?, 
                    ?, ?, ?, 
                    ?, ?, ?
                )
            `;

            const [employeeResult] = await connection.query(SQL_INSERT_EMPLOYEE, [
                city_id,  fullname, job_title,
                password, phone_1,  phone_2,
                address,  salary,   hire_date
            ]);


            const SQL_CREATE_ROLE = `
                INSERT INTO roles ( 
                    can_add_simple_purchase, can_modify_simple_purchase, can_delete_simple_purchase,
                    can_add_delivery,        can_modify_delivery,        can_delete_delivery,
                    can_add_invoice,         can_modify_invoice,         can_delete_invoice,
                    employee_id
                )
                VALUES (
                    0, 0, 0, 
                    0, 0, 0,
                    0, 0, 0, ?
                )
            `;

            const [rolesResult] = await connection.query(SQL_CREATE_ROLE, [ 
                employeeResult.insertId 
            ]);


            await connection.commit();


            if(employeeResult.affectedRows === 0) {
                result = employeeResult;
                result.tableName = `employee`;
            }
            else if(rolesResult.affectedRows === 0) {
                result = rolesResult;
                result.tableName = `roles`;
            }
            else {
                result = employeeResult;
                result.tableName = `employee`;
            }

            return employeeResult;
        }
        catch(error) {
            await connection.rollback();
            throw error;
        }
        finally {
            connection.release();
        }
    },

    update: (data) => {
        const {
            city_id,  fullname, job_title,
            password, phone_1,  phone_2,
            address,  salary,   hire_date, id
        } = data;

        const SQL_UPDATE_EMPLOYEE = `
            UPDATE employee SET
                city_id  = ?, fullname = ?, job_title = ?, 
                password = ?, phone_1  = ?, phone_2   = ?, 
                address  = ?, salary   = ?, hire_date = ?
            WHERE id = ?
        `;

        return dbh.query(SQL_UPDATE_EMPLOYEE, [
            city_id,  fullname, job_title, 
            password, phone_1,  phone_2,  
            address,  salary,   hire_date, id
        ]);
    },

    delete: (id) => {
        const SQL_DELETE_EMPLOYEE = `DELETE FROM employee WHERE id = ? AND (is_archived = 0 || is_deleted = 0)`;
        return dbh.query(SQL_DELETE_EMPLOYEE, [ id ]);
    },

    dispose: (id) => {
        const SQL_DISPOSE_EMPLOYEE = `UPDATE employee SET is_deleted = 1, deletion_date=CURRENT_TIMESTAMP WHERE id = ?`;
        return dbh.query(SQL_DISPOSE_EMPLOYEE, [ id ]);
    },

    restore: (id) => {
        const SQL_DISPOSE_EMPLOYEE = `UPDATE employee SET is_deleted = 0, deletion_date=NULL WHERE id = ?`;
        return dbh.query(SQL_DISPOSE_EMPLOYEE, [ id ]);
    },

    archive: (id) => {
        const SQL_ARCHIVE_EMPLOYEE = `UPDATE employee SET is_archived = 1, archive_date=CURRENT_TIMESTAMP WHERE id = ?`;
        return dbh.query(SQL_ARCHIVE_EMPLOYEE, [ id ]);
    },

    unarchive: (id) => {
        const SQL_ARCHIVE_EMPLOYEE = `UPDATE employee SET is_archived = 0, archive_date=NULL WHERE id = ?`;
        return dbh.query(SQL_ARCHIVE_EMPLOYEE, [ id ]);
    }
};