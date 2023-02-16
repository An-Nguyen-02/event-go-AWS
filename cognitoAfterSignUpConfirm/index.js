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


exports.handler = async (event, context, callback) => {
  const user = event.request.userAttributes;

  try {
    await postgres('users_info').insert({
        user_name: user.preferred_username,
        email: user.email,
        dob: user.birthdate,
        full_name: user.name,
        phone_num: user.phone_number,
    });
    return await getUser(user.email)
  } catch (err) {
    return buildResponse(500, err)
  } finally {
    knex.destroy();
  }
};


async function getUser(userEmail) {
   return await postgres.select('*')
                        .from('user_info')
                        .where('email','=',userEmail)
                        .then((user)=>{
                            if (user.length === 0) {
                                return buildResponse(400, 'User email not found')
                            } else if (user.length === 1) {
                                return buildResponse(200, user[0])
                            } else {
                                return buildResponse(500,'Database error: User email not unique')
                            }
                        })
                        .catch(err => {
                            return buildResponse(500, err)
                        })
}

function buildResponse(statusCode, body) {
    return {
        statusCode,
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(body)
    }
}