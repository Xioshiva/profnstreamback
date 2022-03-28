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
        return;
    }
    if(idUserIsValid(idUser) && idStreamIsValid(idStream)) {
        // or any other method to compute the number of credits to debit 
        // it can depends on the watch-time, the topic (identified with the "idStream")...
        return 1; 
    } else {
        return;
    }
}

/**
 * Return a boolean as the id given exists in the database
 * @param {int} idUser the id of the user
 * @return {boolean}
 */
function idUserIsValid(idUser){
    // as the database is not created yet, we check if the idUser exists with an array
    return filterArray(userList, 'id', idUser).length > 0;
}

/**
 * Return a boolean as the id given exists in the database
 * @param {int} idStream the id of the stream 
 * @return {boolean}
 */
function idStreamIsValid(idStream){
    // as the database is not created yet, we check if the idStream exists with an array
    return filterArray(streamList, 'id', idStream).length > 0;
}

/**
 * Return a boolean as the user has been debited correctly
 * @param {int} idUser the id of the user to debit
 * @param {int} amountOfCredits the amount of credits to debit 
 * @return {String} the status of the call
 */
function debitUser(idUser, amountOfCredits){
    if(idUser === undefined || amountOfCredits === undefined) {
        return -1;
    }
    if(idUserIsValid(idUser) && amountOfCredits > 0) {
        filterArray(userList, 'id', idUser)[0].credits -= amountOfCredits;
        return 0;
    } else {
        return 1;
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
        return filterArray(userList, 'id', idUser)[0].credits;
    } else {
        return "invalid idUser";
    }
}


/**
 * Return the array matching the params
 * @param {Array} array the array of users
 * @param {String} fields the field to filter
 * @param {String} value the value to use as a filter
 * @return {Array} the result of the filter
 */
 function filterArray(array, fields, value){
    fields = Array.isArray(fields) ? fields : [fields];    
    return array.filter((item) => fields.some((field) => item[field] === value));
};

// /!\ Temporary arrays used to fake database
const userList = [
    {id: 0, name:"thomas", credits: 10},
    {id: 1, name:"dorian", credits: 5},
    {id: 2, name:"alexey", credits: 3},
    {id: 3, name:"antoine", credits: 2},
    {id: 4, name:"gustavo", credits: 1},
    {id: 5, name:"trung", credits: 0}    
];

const streamList = [
    {id: 0, name:"orestis"},
    {id: 1, name:"stephane"},
    {id: 2, name:"yacine"},
    {id: 3, name:"nabil"},
    {id: 4, name:"paul"},
    {id: 5, name:"adrient"}    
];

/* -- MAIN -- */

//console.log(filterArray(userList, 'id', 7).length > 0);
//console.log(getUserCredits(2));
//console.log(getUserCredits(7));
// debit user ne devrait jamais être appelé autrement que comme ça
//var status = debitUser(2, computeCreditsToDebit("timestamp", 2, 2));
//console.log("debit status: " + status);
//console.log(getUserCredits(2));