const {dbAWSuser, 
  dbAWSpass, 
  port, 
  dbAWShost,
  dbAWSname} = require('./config')

const axios = require('axios')
const knex = require('knex')

const postgres = knex({
  client: 'pg',
  connection : {
  user : dbAWSuser,
  host: dbAWShost,
  password: dbAWSpass,
  port,
  database: dbAWSname
}
})

const userDetail = {
  dob: '2023-01-02',
  email: 'test6@gmail.com',
  userName: 'test6'

}

const testPost = async () => {
    const {dob, email, userName} = userDetail
    try {

      await postgres.transaction(async (trx) => {
          await trx('user_info')
                .insert({
                    dob,
                    email,
                    user_name: userName
                })
                // .returning('email')
                // .then((userEmail)=>{
                //   postgres.select('*').from('user_info').where('email','=',userEmail).then(data => console.log(data)) 
                // })
          postgres.select('*').from('user_info').where('email','=',email).then(data => console.log(data)) 
  
      })
    } catch (err) {
      console.error('duplicate email')
    }
    
    postgres.destroy()
}

const body = {
  email: 'test5@gmail.com',
  userDetail: {
    userName: 'test',
    email: 'test6@gmail.com',
    dob: '2021-01-01'
  }
}
const testPut = async () => {
      const {email, userDetail} = body
    try {
        const newBody = {
                    email : userDetail.email,
                    user_name: userDetail.userName,
                    dob: userDetail.dob
                }
        await postgres('user_info')
                .where('email','=',email)
                .then(async user => {

                  if (user.length === 0) {
                      buildResponse(400, 'User email not found')
                  } else if (user.length > 1) {
                      buildResponse(500,'Database error: User email not unique')
                  } else {
                        await postgres('user_info')
                        .where('email', '=', email)
                        .update(newBody)
                    buildResponse(200, newBody)
                  }
                })
    } catch (err) {
        buildResponse(400, 'User change into existed email')
    }
    postgres.destroy()
}

const userEmail = 'test4@gmail.com'
const testDelete = async () => {
    try {
        return await postgres.select('*')
                             .from('user_info')
                             .where('email','=',userEmail)
                             .then(async (user)=>{
                                 if (user.length === 0) {
                                     buildResponse(400, 'User email not found')
                                 } else if (user.length === 1) {
                                     await postgres('user_info')
                                             .where('email','=',userEmail)
                                             .del()
                                     buildResponse(200, user[0])
                                 } else {
                                     buildResponse(500,'Database error: User email not unique')
                                 }
                             })
                             .catch(err => {
                                 buildResponse(500, err)
                             })

    } catch (err) {
        buildResponse(400, 'User change into existed email')
        console.error(err)
    }
}

async function test(){

    // const hello = await postgres('event')
    //                   .join('tag','event.event_id','tag.event_id')
    //                   .select('tag.tag_name','event.event_name')
    //                   .where({tag_name: "rock"})
    //                   .where({event_name: "test event"})
    // const hello2 = hello.map(data=>data.event_name)
    // console.log(hello2)

    // const events = await postgres('event').where('event_name','=','test event')
    // console.log(events[0].event_id)
    // console.log(hello.map(data=>data.tag_name))

    // const hello = await postgres('event')
    //                   .join('event_ticket','event_ticket.event_id','event.event_id')
    //                   .join('ticket','ticket.ticket_id','event_ticket.ticket_id')
    //                   .select('ticket.ticket_type','ticket.price','ticket.description')
    //                   .where('event.event_name','=','test event')

    // const hello = await postgres('friendship')
    //                         .where({user_id_1: 2})
    //                         .orWhere({user_id_2: 2})
    // let friendList = []
    // for (let i=0; i<hello.length; i++){
    //   let friendEmail
    //   if (hello[i].user_id_2 === 2){
    //      friendEmail = await postgres('user_info').where({user_id: hello[i].user_id_1})
    //   } else {
    //     friendEmail = await postgres('user_info').where({user_id: hello[i].user_id_2})
    //   }
    //   if (!friendList.includes(friendEmail[0].email)){

    //     friendList.push(friendEmail[0].email)
    //   }
    // }

    // const hello = await postgres('event')
    //                             .join('organizer','event.organizer_email','organizer.email')
    //                             .select('event_id')
    //                             .where({organizer_email: 'test.org@gmail.com'})
    

    // const hello = await postgres('event')
    //         .join('tag','event.event_id','tag.event_id')
    //         .select('tag.tag_name','event.event_name')
    //         .where({event_name: "test event"})
    //         .andWhere({tag_name: "test"})

    // const hello = await postgres('ticket')
    //             .where({
    //                 ticket_type: "baby",
    //                 price: 0,
    //                 description: "Less than 5 years old"
    //             })

    // const hello = await postgres('event')
    //                   .join('tag','event.event_id','tag.event_id')
    //                   .select('tag.tag_name','event.event_id')
    //                   .where('event.event_id','=', 3)

    // const hello = await postgres('user_info')
    //                 .join('user_event','user_event.user_id','user_info.user_id')
    //                 .select('event_id')
    //                 .where('email','=','test5@gmail.com')
    //  console.log(hello)                 

    // postgres.destroy()
    const options = {
  headers: {
    'x-api-key': 'DUBwlix96T5zt3M7tOnJ7ilJt6ufVG1436lyXzXh',
    'Content-Type': 'application/json'
  }
};

axios.get('https://a1fzt90jn3.execute-api.eu-central-1.amazonaws.com/production/event/tag?event_id=17', options)
  .then(response => {
    console.log(response.data);
  })
  .catch(error => {
    console.error(error);
  });
}
test()
// console.log(test())

const buildResponse = (statusCode, body) => {
  console.log(`status code: ${statusCode}`)
  console.log(JSON.stringify(body))
}