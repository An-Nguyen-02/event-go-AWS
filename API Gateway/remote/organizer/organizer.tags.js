const {buildResponse, postgres} = require('../postgres')


async function getOrganizerTags(organizerEmail){
    try {
        const organizerTags = await postgres('event')
                                .join('tag','event.event_id','tag.event_id')
                                .select('tag.tag_name')
                                .where({organizer_email: organizerEmail})
        const tagsArr = organizerTags.map(data => data.tag_name)
        return buildResponse(200, tagsArr)
    } catch (err){
        console.error(err)
        return buildResponse(500, err)
    }
}


module.exports = {
    getOrganizerTags
}