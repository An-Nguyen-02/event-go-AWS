const AWS = require('aws-sdk');

AWS.config.update({
  accessKeyId: process.env.ACCESS_KEY,
  secretAccessKey: process.env.SECRET_KEY
});

const cognitoIdentityServiceProvider = new AWS.CognitoIdentityServiceProvider({apiVersion: '2016-04-18'});
const userPoolId = process.env.USER_POOL_ID;
const path = '/user/cognito'
exports.handler = async (event) => {
    let response;
    switch(true){
      case event.httpMethod === 'PUT' && event.path === path:
        response = await putUserInfoCognito(JSON.parse(event.body))
        break;
        case event.httpMethod === 'DELETE' && event.path === path:
          response = await deleteUserCognito(event.queryStringParameters.email)
          break;
    };

    return response;
}

const deleteUserCognito = async (userEmail) =>{

  const deleteParams = {
      UserPoolId: userPoolId,
      Username: ""
    };

  const userName = await getUserNameFromEmail(userEmail)
  if (userName.hasOwnProperty('statusCode')){
    return userName
  }
  deleteParams.Username = userName

  try {  
    await cognitoIdentityServiceProvider.adminDeleteUser(deleteParams).promise();
    return buildResponse(200, `Successfully deleted user: ${userEmail}`);
  } catch (error) {
    return buildResponse(500, `Error deleting user: ${userEmail}`);
  }
}

const putUserInfoCognito = async (body) =>{
  const userEmail = body.email;
  const cognitoUserName = await getUserNameFromEmail(userEmail)
  if (cognitoUserName.hasOwnProperty('statusCode')){
    return cognitoUserName
  }
  const {email, userName, fullName, dob, phoneNum} = body.userDetail;
  const attributes = {
    birthdate: dob,
    email,
    name: fullName,
    phone_number: phoneNum,
    preferred_username: userName
  }
  const params = {
    UserPoolId: userPoolId,
    Username: cognitoUserName,
    UserAttributes: []
  };
      // Add updated attributes to the `UserAttributes` array
  for (const [key, value] of Object.entries(attributes)) {
    if (value){
      params.UserAttributes.push({
          Name: key,
          Value: value
      });
    }
  } 

  try {
    await cognitoIdentityServiceProvider.adminUpdateUserAttributes(params).promise();
    return buildResponse(200,'User attributes updated successfully.')
  } catch (err) {
    console.log(err);
    return buildResponse(500, 'Error updating user attributes.')
  }
}

const getUserNameFromEmail = async (userEmail) => {
  try {
    const getParams = {
      UserPoolId: userPoolId,
      Filter: `email = "${userEmail}"`
    };
    const getUserNameRes  = await cognitoIdentityServiceProvider.listUsers(getParams).promise();
    const userName = getUserNameRes.Users[0].Username
    return userName
  } catch (err){
      return buildResponse(500, `Error finding user email: ${userEmail}`);
  }
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
