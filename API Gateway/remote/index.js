const {buildResponse} = require('./postgres')
const {
    getUser,
    getUsers,
    putUser,
    deleteUser,
    postUser} = require('./user/user')
const {
    getOrganizer,
    putOrganizer,
    deleteOrganizer,
    postOrganizer} = require('./organizer/organizer')
const {
    getEvent,
    getEvents,
    putEvent,
    deleteEvent,
    postEvent} = require('./event/event')

const {
    getEventTickets,
    postEventTicket,
    putEventTicket,
    deleteEventTicket,
} = require('./event/event.ticket')

const {
    getEventTags,
    getTagEvents,
    postEventTag,
    putEventTag,
    deleteEventTag,
} = require('./event/event.tag')

const {
    getUserFriends,
    postUserFriend,
    deleteUserFriend
} = require('./user/user.friend')

const {
    getUserEvents,
    postUserEvent,
    deleteUserEvent
} = require('./user/user.event')

const {
    getAvailableTags
} = require('./available_tags')

const {getOrganizerTags} = require('./organizer/organizer.tags')
const {getOrganizerEventIDs} = require('./organizer/organizer.events')

const healthPath = '/health'
const userSinglePath = '/user'
const usersPath = '/users'
const userFriendPath = '/user/friend'
const userFriendsPath = '/user/friends'
const userEventPath = '/user/event'
const eventSinglePath = '/event'
const eventsPath = '/events'
const eventTagPath = '/event/tag'
const tagEventsPath = '/tag-events'
const eventTicketPath = '/event/ticket'
const organizerPath = '/organizer'
const organizerTagsPath = '/organizer/tags'
const organizerEventsPath = '/organizer/events'
const availableTagsPath = '/available-tags'

exports.handler = async function (event) {
    let response;
    const body = JSON.parse(event.body)
    const params = event.queryStringParameters
    switch(true) {
        case event.httpMethod === 'GET' && event.path === healthPath:
            response = buildResponse(200)
            break;
        //users path
        case event.httpMethod === 'GET' && event.path === usersPath:
            response = await getUsers()
            break;
        // user path
        case event.httpMethod === 'GET' && event.path === userSinglePath:
            response = await getUser(params.email)
            break;
        case event.httpMethod === 'POST' && event.path === userSinglePath:
            response = await postUser(body)
            break;
        case event.httpMethod === 'PUT' && event.path === userSinglePath:
            response = await putUser(body)
            break;     
        case event.httpMethod === 'DELETE' && event.path === userSinglePath:
            response = await deleteUser(params.email)
            break;
        // user friends path
        case event.httpMethod === 'GET' && event.path === userFriendsPath:
            response = await getUserFriends(params.email)
            break;
        // user friend path
        case event.httpMethod === 'POST' && event.path === userFriendPath:
            response = await postUserFriend(body.userEmail, body.friendEmail)
            break;
        case event.httpMethod === 'DELETE' && event.path === userFriendPath:
            response = await deleteUserFriend(params.user_email, params.friend_email)
            break;
        // user event path
        case event.httpMethod === 'GET' && event.path === userEventPath:
            response = await getUserEvents(params.email)
            break;
        case event.httpMethod === 'POST' && event.path === userEventPath:
            response = await postUserEvent(body.userEmail, body.eventID)
            break;
        case event.httpMethod === 'DELETE' && event.path === userEventPath:
            response = await deleteUserEvent(params.email, params.event_id)
            break;            
        // events path
        case event.httpMethod === 'GET' && event.path === eventsPath:
            response = await getEvents()
            break;        
        // event path
        case event.httpMethod === 'GET' && event.path === eventSinglePath:
            response = await getEvent(params.event_id)
            break;
        case event.httpMethod === 'POST' && event.path === eventSinglePath:
            response = await postEvent(body)
            break;
        case event.httpMethod === 'PUT' && event.path === eventSinglePath:
            response = await putEvent(body)
            break;     
        case event.httpMethod === 'DELETE' && event.path === eventSinglePath:
            response = await deleteEvent(params.event_id)
            break;
        // event tag path
        case event.httpMethod === 'GET' && event.path === eventTagPath:
            response = await getEventTags(params.event_id)
            break; 
        case event.httpMethod === 'POST' && event.path === eventTagPath:
            response = await postEventTag(body.eventID, body.tagName)
            break;  
        case event.httpMethod === 'PUT' && event.path === eventTagPath:
            response = await putEventTag(body.eventID, body.tagName, body.newTagName)
            break;
        case event.httpMethod === 'DELETE' && event.path === eventTagPath:
            response = await deleteEventTag(params.event_id, params.tag_name)
            break;
        // tag events path
        case event.httpMethod === 'GET' && event.path === tagEventsPath:
            response = await getTagEvents(params.tag_name)
            break;         
        // event ticket path
        case event.httpMethod === 'GET' && event.path === eventTicketPath:
            response = await getEventTickets(params.event_id)
            break; 
        case event.httpMethod === 'POST' && event.path === eventTicketPath:
            response = await postEventTicket(body.eventID, body.ticketType, body.price, body.description)
            break;  
        case event.httpMethod === 'PUT' && event.path === eventTicketPath:
            response = await putEventTicket(body.eventID, body.ticketDetail, body.newTicketDetail)
            break;
        case event.httpMethod === 'DELETE' && event.path === eventTicketPath:
            response = await deleteEventTicket(params.event_id, params.ticket_id)
            break;        
        // organizer path
        case event.httpMethod === 'GET' && event.path === organizerPath:
            response = await getOrganizer(params.email)
            break;
        case event.httpMethod === 'POST' && event.path === organizerPath:
            response = await postOrganizer(body)
            break;
        case event.httpMethod === 'PUT' && event.path === organizerPath:
            response = await putOrganizer(body)
            break;     
        case event.httpMethod === 'DELETE' && event.path === organizerPath:
            response = await deleteOrganizer(params.email)
            break;
        // organizer tags path
        case event.httpMethod === 'GET' && event.path === organizerTagsPath:
            response = await getOrganizerTags(params.email)
            break;
        // organizer tickets path
        case event.httpMethod === 'GET' && event.path === organizerEventsPath:
            response = await getOrganizerEventIDs(params.email)
            break;  
        case event.httpMethod === 'GET' && event.path === availableTagsPath:
            response = await getAvailableTags()
            break;   
    }
    return response
}