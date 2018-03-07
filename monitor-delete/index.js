const Promise = require("bluebird");

const sqlUsername = process.env.MSSQL_USERNAME || "";
const sqlPassword = process.env.MSSQL_PASSWORD || "";
const sqlServer = process.env.MSSQL_SERVER || "";
const sqlDatabase = process.env.MSSQL_DATABASE || "";

const mssql = require("mssql");

/**
 * Monitors delete function
 * 
 * @param {any} context function execution context
 * @returns {undefined}
 */
function monitor(context) {
    const options = {
        "user": sqlUsername,
        "password": sqlPassword,
        "server": sqlServer,
        "database": sqlDatabase,
        "options": {
            "encrypt": true
        }
    };
    let _pool = null;
    let _transaction = null;
    new mssql
        .ConnectionPool(options)
        .connect()
        .then((pool) => {
            _pool = pool;
            _transaction = new mssql.Transaction(_pool);
            return _transaction.begin();
        })
        .then(() => {
            const request = new mssql.Request(_transaction);
            return request.query("DELETE FROM dbo.WriteMonitorTable WHERE dbo.WriteMonitorTable.Id IN (SELECT Id FROM dbo.WriteMonitorTable WHERE [Timestamp] < DATEADD(MINUTE,-5,GETDATE()))");
        })
        .then(() => {
            return _transaction.commit();
        })
        .then((result) => {
            mssql.close();
            return Promise.resolve(result);
        })
        .then((result) => {
            context.done();
        })
        .catch((err) => {
            context.done(err);
        });
}
module.exports = monitor;