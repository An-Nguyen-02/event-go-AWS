const axios = require('axios')
const {buildResponse, postgres} = require('./postgres')

const url = 'https://a1fzt90jn3.execute-api.eu-central-1.amazonaws.com/production';
const xApiKey = 'DUBwlix96T5zt3M7tOnJ7ilJt6ufVG1436lyXzXh';
const config = {
    headers: {
      'x-api-key': xApiKey,
      'Content-Type': 'application/json',
    },
  };


async function getEventImageURL(event_id){
    try {
      return await axios.get(`${url}/event/image?event_id=${event_id}`, config)
    } catch (err) {
      return buildResponse(500, `Error getting event image ${err}`)
    }
}

async function deleteEventImageURL(event_id){
  try {
    return await axios.delete(`${url}/event/image?event_id=${event_id}`, config)
  } catch (err) {
    return buildResponse(500, `Error deleting event image ${err}`)
  } 
}

async function getOrganizerImageURL(email){
  try {
    return await axios.get(`${url}/organizer/image?email=${email}`, config)
  } catch (err) {
    return buildResponse(500, `Error getting organizer image ${err}`)
  }
}

async function deleteOrganizerImageURL(email){
  try {
    return await axios.delete(`${url}/organizer/image?email=${email}`, config)
  } catch (err) {
    return buildResponse(500, `Error deleting organizer image ${err}`)
  } 
}

module.exports = {
  getEventImageURL,
  deleteEventImageURL,
  getOrganizerImageURL,
  deleteOrganizerImageURL
}