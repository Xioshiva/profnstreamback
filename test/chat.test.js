const assert = require('assert');
const chat = require('../modules/chat.js');


describe('Chat test', () => {
    it('Should write to cache', () => {
           chat.addMessage("bonjour", "testStream", "hello12345", false);
           chat.addMessage("gangster", "testStream", "test", false);
           chat.addMessage("testman", "testStream", "yoyo", false);
       });
    it('should read from cache', () => {
          messages = chat.getMessages("testStream")["messages"];
          assert.equal(messages[0]["userID"], "Bonjour");
          assert.equal(messages[0]["message"], "hello12345");
          assert.equal(messages[1]["userID"], "gangster");
          assert.equal(messages[1]["message"], "test");
          assert.equal(messages[2]["userID"], "testman");
          assert.equal(messages[2]["message"], "yoyo");
       });
   });