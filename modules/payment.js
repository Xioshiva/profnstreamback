module.exports =  {computeCreditsToDebit, debitUser, getUserCredits}

/**
 * Compute the number of credits to debit from the user account
 * @param {string} timestamp the amount of time the user has spent on the stream
 * @param {int} idUser the id of the user
 * @param {int} idStream the id of the stream 
 * @return {int} the number of credits or -1 as an exception occured
 */
function computeCreditsToDebit(timestamp, idUser, idStream){
    if(timestamp === undefined || idUser === undefined || idStream === undefined) {
        return -1;
    }
    if(idUserIsValid(idUser) && idStreamIsValid(idStream)) {
        // or any other method to compute the number of credits to debit 
        // it can depends on the watch-time, the topic (identified with the "idStream")...
        return 1; 
    } else {
        return -1;
    }
}

/**
 * Return a boolean as the id given exists in the database
 * @param {int} idUser the id of the user
 * @return {boolean}
 */
function idUserIsValid(idUser){
    // as the database is not created yet, we check if the idUser exists with an array
    users = [1,2,3,4,5];
    return users.includes(idUser);
}

/**
 * Return a boolean as the id given exists in the database
 * @param {int} idStream the id of the stream 
 * @return {boolean}
 */
function idStreamIsValid(idStream){
    // as the database is not created yet, we check if the idStream exists with an array
    streams = [1,2,3,4,5];
    return streams.includes(idStream);
}

/**
 * Return a boolean as the user has been debited correctly
 * @param {int} idUser the id of the user to debit
 * @param {int} amountOfCredits the amount of credits to debit 
 * @return {int}
 */
function debitUser(idUser, amountOfCredits){
    if(idUser === undefined || amountOfCredits === undefined) {
        return "idUser or amountOfCredits is undefined";
    }
    if(idUserIsValid(idUser) && amountOfCredits > 0) {
        try {
            // call the private API to debit the user
            // update the database if needed
            console.log("Client " + idUser + " has been debited " + amountOfCredits + " credits");
            return;
        } catch(e) {
            return "error while debiting the user";
        } 
    } else {
        return "invalid idUser or amountOfCredits <= 0";
    }
}

/**
 * Return the number of credits depeding on the idUser
 * @param {int} idUser the id of the user to debit
 * @return {int}
 */
 function getUserCredits(idUser){
    if(idUser === undefined) {
        return "idUser is undefined";
    }
    if(idUserIsValid(idUser)) {
        try {
            nbCredits = 2; // call the private API to get user's credits
            console.log("Client " + idUser + " has " + nbCredits + " credits");
            return;
        } catch(e) {
            return "error while getting user's credits";
        } 
    } else {
        return "invalid idUser";
    }
}