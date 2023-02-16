const { buildResponse, postgres } = require("../postgres")
const {getUser} = require('./user')

// return list containing the user's friends emails
async function getUserFriends(userEmail){
    try {
        const userStringified = await getUser(userEmail)
        if (userStringified.statusCode !== 200){
            return userStringified
        }
        const body = JSON.parse(userStringified.body)
        const userFriendIds = await postgres('friendship')
                                .where({user_id_1: body.user_id})
                                .orWhere({user_id_2: body.user_id})
        let friendEmailList = []
        for (let i=0; i<userFriendIds.length; i++){
            let friendEmail
            if (userFriendIds[i].user_id_2 === body.user_id){
              friendEmail = await postgres('user_info').where({user_id: userFriendIds[i].user_id_1})
            } else {
              friendEmail = await postgres('user_info').where({user_id: userFriendIds[i].user_id_2})
            }
            if (!friendEmailList.includes(friendEmail[0].email)){
      
              friendEmailList.push(friendEmail[0].email)
            }
        }
        return buildResponse(200, friendEmailList)
    } catch (err) {
        console.error(err)
        return buildResponse(500, err)
    }

}

async function postUserFriend(userEmail, friendEmail){
    try {
        const user = await getUser(userEmail)
        if (user.statusCode !== 200){
            return user
        }
        const friend = await getUser(friendEmail)
        if (friend.statusCode !== 200){
            return friend
        }
        const friendBody = JSON.parse(friend.body)
        const userBody = JSON.parse(user.body)
        const friendship = await checkFriendshipExist(userBody.user_id, friendBody.user_id)
        if (friendship === true){
            return buildResponse(400, 'Friendship existed')
        }
        const body = {
                user_id_1: userBody.user_id,
                user_id_2: friendBody.user_id
            }
        await postgres('friendship').insert(body)
        return buildResponse(200, body)
    } catch (err) {
        console.error(err)
        return buildResponse(500, err)
    }
}

async function deleteUserFriend(userEmail, friendEmail){
    try {
        const user = await getUser(userEmail)
        if (user.statusCode !== 200){
            return user
        }
        const friend = await getUser(friendEmail)
        if (friend.statusCode !== 200){
            return friend
        }
        const friendBody = JSON.parse(friend.body)
        const userBody = JSON.parse(user.body)
        let friendship = []
        friendship = await postgres('friendship').where({
            user_id_1: userBody.user_id,
            user_id_2: friendBody.user_id
        })
        let reverse = false
        if (friendship.length === 0){
            reverse = true
            friendship = await postgres('friendship').where({
                user_id_2: userBody.user_id,
                user_id_1: friendBody.user_id
            }).then(data=>{
                if (data.length === 0){
                    return buildResponse(400, 'Wrong user or friend email')
                } else if (data.length === 1){
                    return data[0]
                } else {
                    return buildResponse(500,'Not unique friendship')
                }
            })
        }

        if (friendship.hasOwnProperty('statusCode')){
            return friendship
        }
        let deletedFriendship
        if (reverse){
            deletedFriendship = await postgres('friendship').where({
                user_id_2: userBody.user_id,
                user_id_1: friendBody.user_id
            }).del(['user_id_1','user_id_2'])
        } else {
            deletedFriendship = await postgres('friendship').where({
                user_id_1: userBody.user_id,
                user_id_2: friendBody.user_id
            }).del(['user_id_1','user_id_2'])
        }
        return buildResponse(200, deletedFriendship)
        
    } catch (err){
        console.error(err)
        return buildResponse(500, err)
    }
}

async function checkFriendshipExist(user_id, friend_id){
    try {

        const friendship1 = await postgres('friendship').where({
            user_id_1: user_id,
            user_id_2: friend_id
        })
        const friendship2 = await postgres('friendship').where({
            user_id_2: user_id,
            user_id_1: friend_id
        })
        if (friendship1.length > 0 || friendship2.length > 0){
            return true
        }
        return false
    } catch (err){
        console.error(err)
        return false
    }
}

module.exports = {
    getUserFriends,
    postUserFriend,
    deleteUserFriend
}