const {buildResponse, postgres} = require('../postgres')

async function getOrganizerEventIDs(organizerEmail){
    try {
        const organizerEvents = await postgres('event')
                                .join('organizer','event.organizer_email','organizer.email')
                                .select('event_id')
                                .where({organizer_email: organizerEmail})
        const eventIDsArr = organizerEvents.map(data => data.event_id)
        return buildResponse(200, eventIDsArr)
    } catch (err){
        console.error(err)
        return buildResponse(500, err)
    }
}

module.exports = {
    getOrganizerEventIDs
}