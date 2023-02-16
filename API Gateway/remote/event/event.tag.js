const {buildResponse, postgres} = require('../postgres')

async function getEventTags(eventID) {
    try {

        const eventsDB = await postgres('event')
                      .join('tag','event.event_id','tag.event_id')
                      .select('tag.tag_name','event.event_id')
                      .where('event.event_id','=',eventID)
                      .then(data=>{
                        if (data.length === 0){
                            return {
                                statusCode: 400,
                                message: 'Event id not found'
                            }
                        }
                        return data
                      })
        if (eventsDB.hasOwnProperty('statusCode')) {
            return buildResponse(eventsDB.statusCode, eventsDB.message)
        }
        const tags = eventsDB.map(event=> event.tag_name)
        return buildResponse(200, tags) 
    } catch (err) {
        console.error(err)
        return buildResponse(500, err)
    }
}

async function getTagEvents(tagName) {
    try {
        const tagsDB = await postgres('event')
                    .join('tag','event.event_id','tag.event_id')
                    .select('tag.tag_name','event.event_id')
                    .where({tag_name: tagName})
                    .then(data=>{
                    if (data.length === 0){
                        return {
                            statusCode: 400,
                            message: 'Tag name not found'
                        }
                    }
                    return data
                    })
        if (tagsDB.statusCode === 400) {
            return buildResponse(tagsDB.statusCode, tagsDB.message)
        }
        const tags = tagsDB.map(tag=> tag.event_id)
        return buildResponse(200, tags) 
    } catch (err) {
        console.error(err)
        return buildResponse(500, err)
    }
}


async function postEventTag(eventID, tagName) {
    try { 
        const responseBody = {
                tag_name: tagName,
                event_id: eventID
            }
        const duplicateTag = await postgres('tag')
                                .where('tag_name','=',tagName)
                                .andWhere('event_id','=',eventID)
                                .then(tagData =>{
                                    if (tagData.length > 0 ){
                                        return buildResponse(400, 'Tag name with event existed')
                                    }else {
                                        return tagData
                                    }
                                })
        if (duplicateTag.hasOwnProperty('statusCode')){
            return duplicateTag
        }
        const availableTags = await postgres('available_tags')
                                    .select('tag_name')
        const checkAvailTags = await postgres('available_tags')
                                    .where('tag_name','=',tagName)
                                    .then(tagAvail=>{
                                        if (tagAvail.length === 0){
                                            return buildResponse(400, `Tag not in database, pls choose from this list: ${availableTags.map(data=>data.tag_name)}`)
                                        } else {
                                            return tagAvail
                                        }
                                    })
        if (checkAvailTags.hasOwnProperty('statusCode')){
            return checkAvailTags
        }
        await postgres('tag').insert(responseBody)
        return buildResponse(200, responseBody)
    } catch (err) {
        return buildResponse(500, err)
    }
}

async function putEventTag(eventID, tagName, newTagName) {
    try { 
        const eventExist = await checkEventTagExist(eventID, tagName)
        if (eventExist.hasOwnProperty('statusCode')){
            return eventExist
        }
        const updateTag = await postgres('tag')
                        .where('event_id','=',eventID)
                        .andWhere('tag_name','=',tagName)
                        .update({
                            tag_name: newTagName
                        },['event_id','tag_name'])
        return buildResponse(200, updateTag[0])
    } catch (err){
        console.error(err)
        return buildResponse(500, err)
    }
}

async function checkEventTagExist(eventID, tagName){
    try {
        const eventTag = await postgres('event')
            .join('tag','event.event_id','tag.event_id')
            .select('tag.tag_name','event.event_name')
            .where('event.event_id','=',eventID)
            .andWhere({tag_name: tagName})
            .then(data=>{
            if (data.length === 0){
                return buildResponse(400,'Event id or tag name not found')
            } else if (data.length === 1) {
                return data[0]
            } else {
                return buildResponse(500, 'Duplicate event with tag exist')
            }
            })
        return eventTag
    } catch (err){
        console.error(err)
        return buildResponse(500, err)
    }
}

async function deleteEventTag(eventID, tagName){
    try {
        const eventExist = await checkEventTagExist(eventID, tagName)
        if (eventExist.hasOwnProperty('statusCode')){
            return eventExist
        }
        const deletedEvent = await postgres('tag')
                        .where('event_id','=',eventID)
                        .andWhere('tag_name','=',tagName)
                        .del(['event_id','tag_name'])
        return buildResponse(200, deletedEvent[0])
    } catch (err) {
        console.error(err)
        return buildResponse(500, err)
    }
}

module.exports = {
    getEventTags,
    getTagEvents,
    postEventTag,
    putEventTag,
    deleteEventTag,
}