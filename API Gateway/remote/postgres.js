const host = process.env.HOST
const password = process.env.PASSWORD
const port = process.env.PORT
const user = process.env.USER_NAME
const database = process.env.DB_NAME
const knex = require('knex');
const postgres = knex({
  client: 'pg',
  connection : {
    user,
    host,
    password,
    port,
    database
    }
});

function buildResponse(statusCode, body) {
    return {
        statusCode,
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(body)
    }
}

module.exports = {
    postgres,
    buildResponse
}