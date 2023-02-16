// const AWS = require('aws-sdk');
const { v4: uuidv4 } = require('uuid');
const {
    putEventImage,
    deleteEventImage,
    getEventImageUrl
} = require('./event')

const {
    putOrganizerImage,
    deleteOrganizerImage,
    getOrganizerImageUrl
} = require('./organizer')

exports.handler = async (event) => {
    let response
    const params = event.queryStringParameters;
    let image = null;
    let imageType = null;
    let imageId = null;
    if (event.httpMethod === 'PUT'){
        image = Buffer.from(event.body, 'base64');
        imageType = event.headers['Content-Type'];
        imageId = uuidv4() + "." + imageType.split("/")[1];
    }
    const eventImagePath = '/event/image'
    const organizerImagePath = '/organizer/image'


    //await db.destroy();
    switch (true){    
        case event.httpMethod === 'GET' && event.path === eventImagePath:
            response = await getEventImageUrl(params.event_id)
            break; 
        case event.httpMethod === 'PUT' && event.path === eventImagePath:
            response = await putEventImage(params.event_id, image, imageId, imageType)
            break;  
        case event.httpMethod === 'DELETE' && event.path === eventImagePath:
            response = await deleteEventImage(params.event_id)
            break;  
        case event.httpMethod === 'GET' && event.path === organizerImagePath:
            response = await getOrganizerImageUrl(params.email)
            break;     
        case event.httpMethod === 'PUT' && event.path === organizerImagePath:
            response = await putOrganizerImage(params.email, image, imageId, imageType)
            break;  
        case event.httpMethod === 'DELETE' && event.path === organizerImagePath:
            response = await deleteOrganizerImage(params.email)
            break;     
    }


    return response
};