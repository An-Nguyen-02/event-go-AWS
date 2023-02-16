const {postgres, buildResponse} = require('./postgres')
const {
    uploadFile,
    deleteFile,
    getSignedUrl
} = require ('./s3')

async function getEventImageUrl(event_id){
    try {
        const imageKey = await postgres('event')
                            .where({event_id: event_id})
                            .then(eventData =>{
                                if (eventData.length === 0){
                                    return buildResponse(400, 'Event id not found')
                                } else {
                                    return eventData[0].image
                                }
                            })
        if (!imageKey){
            return buildResponse(200, 'Event has no image')
        }
        if (imageKey.hasOwnProperty('statusCode')){
            return imageKey
        }
        if (imageKey.startsWith('https://')){
            return buildResponse(200, imageKey)
        }
        return await getSignedUrl(imageKey)
    } catch (err){
        return buildResponse(500, err)
    }
}

async function putEventImage(event_id, image, imageId, imageType){
    try {
        const updatePg = await postgres('event')
                                .where({event_id: event_id})
                                .then(async (eventData) => {
                                    if (eventData.length === 0){
                                        return buildResponse(400, 'Event id not found')
                                    } else {
                                        const eventImg = eventData[0].image
                                        if (eventImg && !eventImg.startsWith('https://')){
                                            await deleteEventImage(event_id)
                                        }
                                        await postgres('event')
                                            .where({event_id: event_id})
                                            .update({
                                                image: imageId
                                            })
                                        return eventData
                                        return buildResponse(400, eventImg)
                                    }
                                })
        if (updatePg.hasOwnProperty('statusCode')){
            return updatePg
        }

        return await uploadFile(image, imageType, imageId)
    } catch (err){
        return buildResponse(500, 'Database error')
    }
}

async function deleteEventImage(event_id){
    let eventImage = null;
    try {
        const eventData = await postgres('event').where({event_id: event_id});
        if (eventData.length === 0){
            return buildResponse(400, 'Event id not found');
        } else {
            eventImage = eventData[0].image;
            await postgres('event').where({event_id: event_id}).update({image: null});
        }
    } catch (err) {
        return buildResponse(500, 'Error retrieving event data: ' + err);
    }
    if (!eventImage){
        return buildResponse(200, 'Event has no image')
    }
    if (eventImage.startsWith('https://')) {
        return buildResponse(200, `Delete event ${event_id} image successfully`);
    }
    return await deleteFile(eventImage, event_id);

}





module.exports = {
    putEventImage,
    deleteEventImage,
    getEventImageUrl
}