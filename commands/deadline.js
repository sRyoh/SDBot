const fs = require('fs');
const functions = require('../functions.js');

module.exports = {
    name: 'deadline',
    description: 'Create a deadline that will be pinged a week, a day, and an hour before it is due.',
    args: true,
    usage: '<name> <MM/DD/YYYY> <HH:MM> <AM/PM>' ,
    execute(message, args) {
        if(!functions.checkArgsLength('deadline', args.length, 4, message)) return;
        if(!functions.checkDateFormat(args[1], message)) return;
        if(!functions.checkTimeFormat(args[2], message)) return;
        if(!functions.checkMeridiemFormat(args[3], message)) return;
        
        let index = 0;
        if(!message.client.deadlines.length) {
            for(deadline in message.client.deadlines) {
                index = deadline;
            }
        }

        message.client.deadlines[parseInt(index, 10) + 1] = {
            name : args[0],
            date : args[1],
            time : args[2],
            meridiem : args[3].toUpperCase()
        }

        fs.writeFile('./deadlines.json', JSON.stringify(message.client.deadlines, null, 4), err => {
            if(err) { 
                message.channel.send("error"); 
                throw err;
            } else {
                message.channel.send("Created deadline.")
                .catch(console.error);
            }
        });
    },
}