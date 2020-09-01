const functions = require('../functions.js');

module.exports = {
    name : 'delete',
    description : 'Delete a meeting or deadline by giving the ID',
    args: true,
    usage : '<meeting/deadline> <ID>',
    execute(message, args) {
        if(args[0] === 'meeting') {
            functions.deleteEvent(message.client, args[0], args[1])
            message.channel.send(`${message.author} here is the updated list of meetings.`);
            functions.createEmbed('#0099ff', 'Meetings','List of all upcoming meetings', 
                        'https://i.ibb.co/VgRkdt8/baseline-schedule-white-18dp.png',
                        'SD Bot [meetings]', message.channel, message.client);
        } else if(args[0] === 'deadline') {
            functions.deleteEvent(message.client, args[0], args[1])
            message.channel.send(`${message.author} here is the updated list of meetings.`);
            functions.createEmbed('#9e0000', 'Deadlines','List of all upcoming deadlines',
                        'https://i.ibb.co/2M6jJkq/baseline-event-white-18dp.png', 
                        'SD Bot [deadlines]', message.channel, message.client);
        }
    },
};