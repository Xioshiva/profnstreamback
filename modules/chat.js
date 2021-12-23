
function addMessage(userId, streamId, message, isQuestion){

}

function getMessages(streamId){
  return {
    "messages" : [
      { 
        "userID" : "test",
        "message": "heyyyy"
      },
      { 
        "userID" : "otherTest",
        "message": "helloooo"
      }
    ]
  }
}


module.exports =  {addMessage, getMessages}