module.exports =  {computeCreditsToDebit, debitUser, getUserCredits}

/**
 * Compute the number of credits to debit from the user account
 * @param {string} timestamp the amount of time the user has spent on the stream
 * @param {int} userID the id of the user
 * @param {int} streamID the id of the stream 
 * @return {int} the number of credits or -1 as an exception occured
 */
function computeCreditsToDebit(timestamp, userID, streamID){
    if(timestamp === undefined || userID === undefined || streamID === undefined) {
        return -1;
    }
    if(userIDIsValid(userID) && streamIDIsValid(streamID)) {
        // or any other method to compute the number of credits to debit 
        // it can depends on the watch-time, the topic (identified with the "streamID")...
        return 1; 
    } else {
        return -1;
    }
}

/**
 * Return a boolean as the id given exists in the database
 * @param {int} userID the id of the user
 * @return {boolean}
 */
function userIDIsValid(userID){
    // as the database is not created yet, we check if the userID exists with an array
    users = [1,2,3,4,5];
    return users.includes(userID);
}

/**
 * Return a boolean as the id given exists in the database
 * @param {int} streamID the id of the stream 
 * @return {boolean}
 */
function streamIDIsValid(streamID){
    // as the database is not created yet, we check if the streamID exists with an array
    streams = [1,2,3,4,5];
    return streams.includes(streamID);
}

/**
 * Return a boolean as the user has been debited correctly
 * @param {int} userID the id of the user to debit
 * @param {int} amountOfCredits the amount of credits to debit 
 * @return {int}
 */
function debitUser(userID, amountOfCredits){
    if(userID === undefined || amountOfCredits === undefined) {
        return "userID or amountOfCredits is undefined";
    }
    if(userIDIsValid(userID) && amountOfCredits > 0) {
        try {
            // call the private API to debit the user
            // update the database if needed
            console.log("Client " + userID + " has been debited " + amountOfCredits + " credits");
            return;
        } catch(e) {
            return "error while debiting the user";
        } 
    } else {
        return "invalid userID or amountOfCredits <= 0";
    }
}

/**
 * Return the number of credits depeding on the userID
 * @param {int} userID the id of the user to debit
 * @return {int}
 */
 function getUserCredits(userID){
    if(userID === undefined) {
        return "userID is undefined";
    }
    if(userIDIsValid(userID)) {
        try {
            nbCredits = 2; // call the private API to get user's credits
            console.log("Client " + userID + " has " + nbCredits + " credits");
            return;
        } catch(e) {
            return "error while getting user's credits";
        } 
    } else {
        return "invalid userID";
    }
}
