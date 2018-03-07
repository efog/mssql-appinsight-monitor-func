const Promise = require("bluebird");

const sqlUsername = process.env.MSSQL_USERNAME || "";
const sqlPassword = process.env.MSSQL_PASSWORRD || "";
const sqlServer = process.env.MSSQL_SERVER || "";
const sqlDatabase = process.env.MSSQL_DATABASE || "";

const mssql = require("mssql");

/**
 * Application level monitoring function
 * 
 * @param {any} context execution context
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
    mssql.connect(options)
        .then((pool) => {
            _pool = pool;
            return _pool.request().query("select * from SalesLT.Address");
        })
        .then((result) => {
            _pool.close();
        })
        .then((result) => {
            context.done();
        })
        .catch((err) => {
            context.done(err);
        });
}
module.exports = monitor;