const {buildResponse, postgres} = require('./postgres')

async function getAvailableTags(){
    try {
        const availableTags = await postgres('available_tags')
                            .select('tag_name')
        return buildResponse(200, availableTags.map(data=>data.tag_name))
    } catch (err){
        return buildResponse(500, err)
    }
}

module.exports = {
    getAvailableTags
}