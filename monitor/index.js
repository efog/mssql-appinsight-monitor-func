const Promise = require("bluebird");

const sqlUsername = process.env.MSSQL_USERNAME || "";
const sqlPassword = process.env.MSSQL_PASSWORRD || "";
const sqlServer = process.env.MSSQL_SERVER || "";
const sqlDatabase = process.env.MSSQL_DATABASE || "";

const mssql = require("mssql");

let _pool = null;

/**
 * Gets cuurent function connection pool
 * 
 * @param {any} options connection pool options
 * @return {Promise} get connection pool promise
 */
function getPool(options) {
    const promise = new Promise((resolve, reject) => {
        if (_pool) {
            return resolve(_pool);
        }
        return mssql.connect(options)
            .then((pool) => {
                _pool = pool;
                return resolve(_pool);
            });
    });
    return promise;
}

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
    getPool(options)
        .then((pool) => {
            return pool.request().query("select * from SalesLT.Address");
        })
        .then((result) => {
            context.done();
        })
        .catch((err) => {
            context.done(err);
        });
}
module.exports = monitor;