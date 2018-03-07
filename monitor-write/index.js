const Promise = require("bluebird");

const sqlUsername = process.env.MSSQL_USERNAME || "";
const sqlPassword = process.env.MSSQL_PASSWORD || "";
const sqlServer = process.env.MSSQL_SERVER || "";
const sqlDatabase = process.env.MSSQL_DATABASE || "";

const mssql = require("mssql");

/**
 * Monitors writes operation
 * 
 * @param {any} context execution context
 * @returns {undefined}
 */
function monitorWrite(context) {
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
            request.input("message", mssql.NVarChar, "OMGPONIES");
            return request.query("insert into dbo.WriteMonitorTable (Message) values (@message)");
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
module.exports = monitorWrite;