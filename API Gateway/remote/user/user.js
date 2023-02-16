const {postgres, buildResponse} = require('../postgres')

async function getUsers() {
   return await postgres.select('*')
                        .from('user_info')
                        .then((users)=>{
                            return buildResponse(200, {users: users})
                        })
                        .catch(err => {
                            console.error(err)
                            return buildResponse(500,'Server internal error')
                        })
}

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

async function postUser(userDetail) {
    const {email,
        dob,
        userName,
        fullName,
        phoneNum,
        emailAlert,
        textAlert,
        webAlert,
        emailPromo,
        address,
        paymentCard
    } = userDetail
    try {
        await postgres.transaction(async (trx) => {

            await trx('user_info')
                .insert({
                    dob,
                    email,
                    user_name: userName,
                    full_name: fullName,
                    email_alert: emailAlert,
                    text_alert: textAlert,
                    web_alert: webAlert,
                    phone_num: phoneNum,
                    email_promotion: emailPromo,
                    address,
                    payment_card: paymentCard
            })
            
  
      })

        return await getUser(email)
    } catch (err) {
        console.error(err)
        return buildResponse(500, err)
        
    }
}

// expect request body {
//     email:
//     userDetail: {
//      dob:
//      email:
//      userName,
//         fullName,
//         phoneNum,
//         emailAlert,
//         textAlert,
//         webAlert,
//         emailPromo,
//         address,
//         paymentCard
//     }
// }
async function putUser(body) {
    const {email, userDetail} = body
        const {
        dob,
        userName,
        fullName,
        phoneNum,
        emailAlert,
        textAlert,
        webAlert,
        emailPromo,
        address,
        paymentCard
    } = userDetail
    const newEmail = userDetail.email
    try {
        const newBody = {
                    email : newEmail,
                    dob,
                    user_name: userName,
                    full_name: fullName,
                    email_alert: emailAlert,
                    text_alert: textAlert,
                    web_alert: webAlert,
                    phone_num: phoneNum,
                    email_promotion: emailPromo,
                    address,
                    payment_card: paymentCard
                }
        return await postgres('user_info')
                .where('email','=',email)
                .then(async user => {
                    if (user.length === 0) {
                        return buildResponse(400, 'User email not found')
                    } else if (user.length === 1) {
                            await postgres('user_info')
                            .where('email', '=', email)
                            .update(newBody)
                        return buildResponse(200, newBody)
                    } else {
                        return buildResponse(500,'Database error: User email not unique')
                    }
                })
    } catch (err) {
        console.error(err)
        return buildResponse(500, err)
        
    }
}

// not optimized yet because need to make 2 call, first call to see if email exist, second call to delete
async function deleteUser(userEmail) {
    try {
        return await postgres.select('*')
                             .from('user_info')
                             .where('email','=',userEmail)
                             .then(async (user)=>{
                                 if (user.length === 0) {
                                    return buildResponse(400, 'User email not found')
                                 } else if (user.length === 1) {
                                     await postgres('user_info')
                                             .where('email','=',userEmail)
                                             .del()
                                    return buildResponse(200, user[0])
                                 } else {
                                    return buildResponse(500,'Database error: User email not unique')
                                 }
                             })
                             .catch(err => {
                                return buildResponse(500, err)
                             })

    } catch (err) {
        console.error(err)
        return buildResponse(500, err)
    }
}

module.exports = {
    getUser,
    getUsers,
    postUser,
    deleteUser,
    putUser
}