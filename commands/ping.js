module.exports = {
    name : 'ping',
    aliases : ['pong', 'pingpong'],
    cooldown : 5,
    description : 'Ping!',
    execute(message, args) {
        message.channel.send('Pong');
    },
};