const {postgres, buildResponse} = require('../postgres')
const {getEventTickets} = require('./event.ticket')
const {getEventTags} = require('./event.tag')
const {
    getEventImageURL,
    deleteEventImageURL
} = require('../s3Image')
async function getEvents() {
   return await postgres.select('*')
                        .from('event')
                        .then((events)=>{
                            return buildResponse(200, {events: events})
                        })
                        .catch(err => {
                            console.error(err)
                            return buildResponse(500, err)
                        })}
                        

async function getEvent(eventID) {
  const eventBasicInfo = await postgres.select('*')
                        .from('event')
                        .where('event_id','=',eventID)
                        .then((event)=>{
                            if (event.length === 0) {
                                return buildResponse(400, 'Event id not found')
                            } else if (event.length === 1) {
                                return event[0]
                            } else {
                                return buildResponse(500,'Database error: Event name not unique')
                            }
                        })
                        .catch(err => {
                            return buildResponse(500, err)
                        })
    if (eventBasicInfo.hasOwnProperty('statusCode')){
        return eventBasicInfo
    }
    
    const eventImg = eventBasicInfo.image
    if (eventImg && !eventImg.startsWith('http://')){
        eventBasicInfo.image = await getEventImageURL(eventID)
    }


    const eventTags = await getEventTags(eventID)
    if (eventTags.statusCode !== 200){
        return eventTags
    }
    
    const eventTickets = await getEventTickets(eventID)
    if (eventTickets.statusCode !== 200){
        return eventTickets
    }

    const body = Object.assign(eventBasicInfo, 
                                {tags: JSON.parse(eventTags.body)}, 
                                {tickets: JSON.parse(eventTickets.body)})
    return buildResponse(200, body)
    
}

async function postEvent(eventDetail) {
    const { 
        eventName, 
        organizerEmail, 
        eventTime,
        location,
        image,
        descriptions
    } = eventDetail
    try {
        const eventID = await postgres('event')
                        .insert({
                            organizer_email: organizerEmail,
                            descriptions,
                            event_name: eventName,
                            event_time : eventTime,
                            location,
                            image
                    },['event_id'])
        return await getEvent(eventID[0].event_id)
    } catch (err) {
        console.error(err)
        return buildResponse(500, err)
        
    }
}
// expect request body {
//     eventID:
//     eventDetail: {
//      organizerEmail:
//      descriptions:
//      eventID:
//        eventTime: "2020-07-01 19:10:25+00",
//        location,
//        image,
//     }
// }
async function putEvent(body) {
    const {eventID, eventDetail} = body
        const { 
        organizerEmail, 
        eventTime,
        location,
        image,
        descriptions,
        eventName
    } = eventDetail 
    try {
        const newBody = {
                    organizer_email : organizerEmail,
                    event_name: eventName,
                    descriptions,
                    image,
                    location,
                    eventTime
                }
 
        return await postgres('event')
                .where('event_id','=',eventID)
                .then(async event => {
                    if (event.length === 0) {
                        return buildResponse(400, 'Event name not found')
                    } else if (event.length === 1) {
                        const eventImg = event[0].image
                        if (eventImg && !eventImg.startsWith('https://')){
                            await deleteEventImageURL(eventID)
                        }
                        await postgres('event')
                            .where('event_id', '=', eventID)
                            .update(newBody)
                        return buildResponse(200, newBody)
                    } else {
                        return buildResponse(500,'Database error: Event name not unique')
                    }
                })
    } catch (err) {
        console.error(err)
        return buildResponse(500, err)
        
    }
}

// not optimized yet because need to make 2 call, first call to see if email exist, second call to delete
async function deleteEvent(eventID) {
    try {
        return await postgres.select('*')
                             .from('event')
                             .where('event_id','=',eventID)
                             .then(async (event)=>{
                                 if (event.length === 0) {
                                    return buildResponse(400, 'Event id not found')
                                 } else if (event.length === 1) {
                                     await postgres('event')
                                             .where('event_id','=',eventID)
                                             .del()
                                    return buildResponse(200, event[0])
                                 } else {
                                    return buildResponse(500,'Database error: Event id not unique')
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
    getEvent,
    getEvents,
    postEvent,
    deleteEvent,
    putEvent,
}