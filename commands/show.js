const functions = require('../functions.js');

module.exports = {
    name : 'show',
    description : 'Shows the current meetings and deadlines, can specify to show only one of them',
    args : true,
    usage : '<meetings/deadlines/all>',
    execute(message, args) {
        if(args[0] === 'meetings') {
            functions.createEmbed('#0099ff', 'Meetings','List of all upcoming meetings', 
                        'https://i.ibb.co/VgRkdt8/baseline-schedule-white-18dp.png',
                        'SD Bot [meetings]', message.channel, message.client);
        } else if (args[0] === 'deadlines') {
            functions.createEmbed('#9e0000', 'Deadlines','List of all upcoming deadlines',
                        'https://i.ibb.co/2M6jJkq/baseline-event-white-18dp.png', 
                        'SD Bot [deadlines]', message.channel, message.client);
        } else if (args[0] === 'all') {
            functions.createEmbed('#9e0000', 'Deadlines','List of all upcoming deadlines',
                        'https://i.ibb.co/2M6jJkq/baseline-event-white-18dp.png',
                        'SD Bot [deadlines]', message.channel, message.client);
                        functions.createEmbed('#0099ff', 'Meetings','List of all upcoming meetings', 
                        'https://i.ibb.co/VgRkdt8/baseline-schedule-white-18dp.png',
                        'SD Bot [meetings]', message.channel, message.client);
        }
    },
};
