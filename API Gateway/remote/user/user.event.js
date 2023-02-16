const { buildResponse, postgres } = require("../postgres")
const {getEvent} = require('../event/event')
const {getUser} = require('./user')
async function getUserEvents(userEmail){
    try {
        return await postgres('user_info')
                    .join('user_event','user_event.user_id','user_info.user_id')
                    .select('event_id')
                    .where('email','=',userEmail)
                    .then(data => {
                        if (data.length === 0){
                            return buildResponse(400, 'Wrong user email')
                        }
                        return buildResponse(200, data.map(event=>event.event_id))
                    })
    } catch (err){
        console.error(err)
        return buildResponse(500, err)
    }
}

async function postUserEvent(userEmail, eventID){
    try {
        const checkEvent = await getEvent(eventID)
        if (checkEvent.statusCode !== 200){
            return checkEvent
        }
        const checkUser = await getUser(userEmail)
        if (checkUser.statusCode !== 200){
            return checkUser
        }
        const body = await postgres('user_event')
            .insert({
                user_id: JSON.parse(checkUser.body).user_id,
                event_id: eventID
            },['user_id','event_id'])
        return buildResponse(200, body[0])
    } catch (err){
        console.error(err)
        return buildResponse(500, err)
    }
}

async function deleteUserEvent(userEmail, eventID){
        try {
        const checkEvent = await getEvent(eventID)
        if (checkEvent.statusCode !== 200){
            return checkEvent
        }
        const checkUser = await getUser(userEmail)
        if (checkUser.statusCode !== 200){
            return checkUser
        }
        const body = await postgres('user_event')
            .where({
                user_id: JSON.parse(checkUser.body).user_id,
                event_id: eventID
            },)
            .del(['user_id','event_id'])
        return buildResponse(200, body[0])

    } catch (err){
        console.error(err)
        return buildResponse(500, err)
    }
}

module.exports = {
    getUserEvents,
    postUserEvent,
    deleteUserEvent
}