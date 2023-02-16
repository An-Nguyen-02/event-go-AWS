const {postgres, buildResponse} = require('../postgres')
const {getOrganizerEventIDs} = require('./organizer.events')
const {getOrganizerTags} = require('./organizer.tags')
const {
    getOrganizerImageURL,
    deleteOrganizerImageURL
} = require('../s3Image')
async function getOrganizer(organizerEmail) {
    const basicOrganizerInfo = await postgres.select('*')
                                .from('organizer')
                                .where('email','=',organizerEmail)
                                .then((organizer)=>{
                                    if (organizer.length === 0) {
                                        return buildResponse(400, 'Organizer email not found')
                                    } else if (organizer.length === 1) {
                                        return organizer[0]
                                    } else {
                                        return buildResponse(500,'Database error: Organizer email not unique')
                                    }
                                })
                                .catch(err => {
                                    return buildResponse(500, err)
                                })
    if (basicOrganizerInfo.hasOwnProperty('statusCode')){
        return basicOrganizerInfo
    }

    const organizerImg = basicOrganizerInfo.image
    if (organizerImg && !organizerImg.startsWith('http://')){
        basicOrganizerInfo.image = await getOrganizerImageURL(organizerEmail)
    }
    
    const organizerEventIDs = await getOrganizerEventIDs(organizerEmail)
    if (organizerEventIDs.statusCode !== 200){
        return organizerEventIDs
    }
    
    const organizerTags = await getOrganizerTags(organizerEmail)
    if (organizerTags.statusCode !== 200){
        return organizerTags
    }
    const body = Object.assign(basicOrganizerInfo,
                                {events: JSON.parse(organizerEventIDs.body)},
                                {tags: JSON.parse(organizerTags.body)})
    return buildResponse(200, body)
}

async function postOrganizer(organizerDetail) {
    const {description, email, organizerName, image, website} = organizerDetail
    try {
        await postgres.transaction(async (trx) => {

            await trx('organizer')
                .insert({
                    description,
                    email,
                    organizer_name: organizerName,
                    image,
                    website
            })
            
  
      })
        return await getOrganizer(email)
    } catch (err) {
        console.error(err)
        return buildResponse(500, err)
        
    }
}

// expect request body {
//     email:
//     organizerDetail: {
//      image:
//      email:
//      website:
//      organizerName
//      description
//     }
// }
async function putOrganizer(body) {
    const {email, organizerDetail} = body
    try {
        const newBody = {
                    email : organizerDetail.email,
                    organizer_name: organizerDetail.organizerName,
                    description: organizerDetail.description,
                    website: organizerDetail.website,
                    image: organizerDetail.image
                }
        return await postgres('organizer')
                .where('email','=',email)
                .then(async organizer => {
                    if (organizer.length === 0) {
                        return buildResponse(400, 'Organizer email not found')
                    } else if (organizer.length === 1) {
                        const organizerImg = organizer[0].image
                        if (organizerImg && !organizerImg.startsWith('https://')){
                            await deleteOrganizerImageURL(email)
                        }
                        await postgres('organizer')
                            .where('email', '=', email)
                            .update(newBody)
                        return buildResponse(200, newBody)
                    } else {
                        return buildResponse(500,'Database error: Organizer email not unique')
                    }
                })
    } catch (err) {
        console.error(err)
        return buildResponse(400, 'Organizer change into existed email')
        
    }
}

// not optimized yet because need to make 2 call, first call to see if email exist, second call to delete
async function deleteOrganizer(organizerEmail) {
    try {
        return await postgres.select('*')
                             .from('organizer')
                             .where('email','=',organizerEmail)
                             .then(async (organizer)=>{
                                 if (organizer.length === 0) {
                                    return buildResponse(400, 'Organizer email not found')
                                 } else if (organizer.length === 1) {
                                     await postgres('organizer')
                                             .where('email','=',organizerEmail)
                                             .del()
                                    return buildResponse(200, organizer[0])
                                 } else {
                                    return buildResponse(500,'Database error: Organizer email not unique')
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
    getOrganizer,
    postOrganizer,
    deleteOrganizer,
    putOrganizer
}