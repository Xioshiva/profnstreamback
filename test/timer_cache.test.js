const assert = require('assert');
const { get } = require('http');

describe('Timer_cache', () => {
    addUserTimerForAStream("testStream0","testUser0");
    it('Create Timer in Cache',() => {
        assert.equal(getUserTime("testStream0","testUser0"),5);
    })
    addUserTimerForAStream("testStream1","testUser0");
    it('Get all stream from a user',() =>{
        let i = 0;
        let array = GetAllStreamIdFromAUser("testUser0");
        array.forEach(element => {
            if(element == "testStream1" && element == "testStream2"){
                i += 1;
            }
            assert.equal(i,2);
        });
    })
});