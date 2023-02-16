const {postgres, buildResponse} = require('./postgres')

const {
    uploadFile,
    deleteFile,
    getSignedUrl
} = require ('./s3')

async function getOrganizerImageUrl(email){
    try {
        const imageKey = await postgres('organizer')
                            .where({email: email})
                            .then(orgData =>{
                                if (orgData.length === 0){
                                    return buildResponse(400, 'Organizer email not found')
                                } else {
                                    return orgData[0].image
                                }
                            })
        if (!imageKey){
            return buildResponse(200, 'Organizer has no image')
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

async function putOrganizerImage(email, image, imageId, imageType){
    try {
        const updatePg = await postgres('organizer')
                            .where({email: email})
                            .then(async (organizerData) => {
                                if (organizerData.length === 0){
                                    return buildResponse(400, 'Organizer email not found')
                                } else {
                                    const organizerImg = organizerData[0].image
                                    if (organizerImg && !organizerImg.startsWith('https://')){
                                        await deleteOrganizerImage(email)
                                    }                                    
                                    await postgres('organizer')
                                        .where({email: email})
                                        .update({
                                            image: imageId
                                        })
                                    return organizerData[0]
                                }
                            })
        if (updatePg.hasOwnProperty('statusCode')){
            return updatePg
        }

        return await uploadFile(image, imageType, imageId)
    } catch (err){
        return buildResponse(500, err)
    }
}

async function deleteOrganizerImage(email){
    // return buildResponse(200, 'test')
    try {
        const deletePg = await postgres('organizer')
                            .where({email: email})
                            .then(async (organizerData)=>{
                                if (organizerData.length === 0){
                                    return buildResponse(400, 'Organizer email not found')
                                } else {
                                    await postgres('organizer')
                                        .where({email: email})
                                        .update({
                                            image: null
                                        })
                                    return organizerData[0].image
                                }
                            })
        if (!deletePg){
            return buildResponse(200, 'Organizer has no image')
        }
        if (deletePg.hasOwnProperty('statusCode')){
            return deletePg
        }
        if (deletePg.startsWith('https://')){
            return buildResponse(200, `Delete organizer ${event_id} image successfully`)
        }
        return await deleteFile(deletePg, email)
        
    } catch (err) {
        return buildResponse(500, err)
    }
}

module.exports = {
    putOrganizerImage,
    deleteOrganizerImage,
    getOrganizerImageUrl
}