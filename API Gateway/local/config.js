const dotenv = require('dotenv');
dotenv.config({path: __dirname + '/.env' });

module.exports = {
    port: process.env.PORT || 8000,
    dbLocalUserName: process.env.LOCAL_USER_NAME,
    dbLocalPass: process.env.LOCAL_PASSWORD,
    dbAWSuser: process.env.AWS_DB_USER_NAME,
    dbAWSpass: process.env.AWS_DB_PASSWORD,
    dbAWShost: process.env.AWS_DB_HOST,
    dbAWSname: process.env.AWS_DB_NAME
}