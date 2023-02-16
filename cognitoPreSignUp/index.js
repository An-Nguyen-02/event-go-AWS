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

export const handler = async(event, context, callback) => {
    const userEmail = event.request.userAttributes.email
    try {
        const user = await postgres
                        .select('*')
                        .from('user_info')
                        .where('email', userEmail)
                        .first();

    if (user) {
      return callback(null, generatePolicy(event.request.userAttributes, 'Deny', event.methodArn));
    }
        return callback(null,event)
    } catch (err){
        return callback(err)
    }
};

function generatePolicy(principalId, effect, resource) {
  const authResponse = {};
  authResponse.principalId = principalId;
  if (effect && resource) {
    const policyDocument = {};
    policyDocument.Version = '2012-10-17';
    policyDocument.Statement = [];
    const statementOne = {};
    statementOne.Action = 'execute-api:Invoke';
    statementOne.Effect = effect;
    statementOne.Resource = resource;
    policyDocument.Statement[0] = statementOne;
    authResponse.policyDocument = policyDocument;
  }
  return authResponse;
}