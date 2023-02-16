const { buildResponse, postgres } = require("../postgres")
async function getEventTickets(eventID){
   return await postgres('event')
                      .join('event_ticket','event_ticket.event_id','event.event_id')
                      .join('ticket','ticket.ticket_id','event_ticket.ticket_id')
                      .select('ticket_type','price','description','ticket.ticket_id')
                      .where('event.event_id','=',eventID)
                      .then(data=>{
                        if (data.length === 0){
                            return buildResponse(400,'Event id not found')
                        }
                        return buildResponse(200, data)
                      })
                      .catch(err =>{
                        console.error(err)
                        return buildResponse(500, err)
                      })

}

async function postEventTicket(eventID, tickeType, price, description){
    try {
        const ticket = await checkExistAndCreateTicket(tickeType, price, description)
        if (ticket.hasOwnProperty('statusCode')){
            return ticket
        }
        const addedTicket = await postgres('event_ticket')
                            .insert({
                                event_id: eventID,
                                ticket_id: ticket.ticket_id
                            },['event_id','ticket_id'])
        return buildResponse(200, addedTicket)
    } catch (err) {
        console.error(err)
        return buildResponse(500, err)
    }
}

async function putEventTicket(eventID, ticketDetail, newTicketDetail){
    try {
        const {ticketType, price, description} = ticketDetail
        const ticket = await getTicket(ticketType, price, description)
        if (ticket.hasOwnProperty('statusCode')){
            return ticket
        }
        const ticketLinkOther= await postgres('event_ticket')
                            .join('ticket','event_ticket.ticket_id','ticket.ticket_id')
                            .select('event_ticket.event_id','ticket.ticket_type','ticket.price','ticket.description')
                            .whereNot('event_ticket.event_id','=',eventID)
                            .andWhere({
                                ticket_type: ticketDetail.ticketType,
                                price: ticketDetail.price,
                                description: ticketDetail.description
                            })
                            .then(data=>{
                                if (data.length === 0){
                                    return buildResponse(200,'ticket does not link with other event')
                                } 
                                return buildResponse(500, 'ticket link with other event')
                            })
        if (ticketLinkOther.statusCode === 200){
            await postgres('ticket').where({
                ticket_id: ticket.ticket_id
            }).update({
                ticket_type: newTicketDetail.ticketType,
                price: newTicketDetail.price,
                description: newTicketDetail.description
            })
        } else if (ticketLinkOther.statusCode === 500){
            const newTicketId =  await postgres('ticket')
                                    .insert({
                                        description: newTicketDetail.description,
                                        price: newTicketDetail.price,
                                        ticket_type: newTicketDetail.ticketType
                                    },['ticket_id'])
            await postgres('event_ticket')
                .where({
                    event_id: eventID,
                    ticket_id: ticket.ticketId
                })
                .update({
                    ticket_id: newTicketId
                })
        }
        return buildResponse(200, 'Ticket adjusted')
    } catch (err){
        console.error(err)
        return buildResponse(500, err)
    }
}

// does not delete the ticket, just the link between the event and ticket
async function deleteEventTicket(eventID, ticketID){
    try {

        const ticket = await getTicketById(ticketID)
        if (ticket.hasOwnProperty('statusCode')){
            return ticket
        }

        const deletedEventTicket = await postgres('event_ticket')
                                    .where({
                                        ticket_id: ticketID,
                                        event_id: eventID
                                    }).del(['ticket_id','event_id'])
        return buildResponse(200, deletedEventTicket)
    } catch (err){
        console.err('err')
        return buildResponse(500, err)
    }
}

async function checkExistAndCreateTicket(ticketType, price, description){
    try {
        let ticket = await getTicket(ticketType, price, description)
        if (ticket.statusCode === 400) {
            await postgres('ticket')
                .insert({
                    description,
                    price,
                    ticket_type: ticketType
                })
            ticket = await getTicket(ticketType, price, description)
        }
        return ticket
    } catch(err) {
        console.error(err)
        return buildResponse(500, err)
    }
}

async function getTicket(ticketType, price, description){
    return await postgres('ticket')
                .where({
                    ticket_type: ticketType,
                    price,
                    description
                })
                .then(data=>{
                    if (data.length === 0){
                        return buildResponse(400, 'ticket detail not found')
                    } else if (data.length === 1){
                        return data[0]
                    } else {
                        return buildResponse(500,'ticket not unique')
                    }
                })
                .catch(err=>{
                    console.error(err)
                    return buildResponse(500, err)
                })
}

async function getTicketById(ticketID){
        return await postgres('ticket')
                .where({
                    ticket_id: ticketID
                })
                .then(data=>{
                    if (data.length === 0){
                        return buildResponse(400, 'ticket id not found')
                    } else if (data.length === 1){
                        return data[0]
                    } else {
                        return buildResponse(500,'ticket not unique')
                    }
                })
                .catch(err=>{
                    console.error(err)
                    return buildResponse(500, err)
                })
}
module.exports = {
    getEventTickets,
    postEventTicket,
    putEventTicket,
    deleteEventTicket,
}