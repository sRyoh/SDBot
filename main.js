const fs = require('fs');
const Discord = require('discord.js');
const { prefix, token, meetings_deadlines } = require('./config.json');

const client = new Discord.Client();
client.commands = new Discord.Collection();
client.meetings = require('./meetings.json');
client.deadlines = require('./deadlines.json');

const cooldowns = new Discord.Collection();
const functions = require('./functions.js');

const commandFiles = fs.readdirSync('./commands').filter(file => file.endsWith('.js'));
for (const file of commandFiles) {
	const command = require(`./commands/${file}`);
	client.commands.set(command.name, command);
}

const MIN_INTERVAL = 60 * 1000;

// Event that signals the bot is running
client.once('ready', () => {
    console.log('SD Bot is online.');
});

// Event that will create an embed for deadlines and meetings every 24 hours
client.on('ready', () => {    
    const botChannel = client.channels.cache.get(meetings_deadlines);

    setInterval(function () {
        let today = new Date();
        today.setHours(today.getHours() - 4);
        let time = `${today.getHours()}:${('0'+today.getMinutes()).slice(-2)}`;
        
        if(time === "9:00") {
            // Clean up the channel's previous messages
            botChannel.bulkDelete(100)
            .then(messages => console.log(`Bulk deleted ${messages.size} messages`))
            .catch(console.error);

            // Create meeting and deadline embeds every 24 hours
            functions.createEmbed('#9e0000', 'Deadlines','List of all upcoming deadlines',
                                  'https://i.ibb.co/2M6jJkq/baseline-event-white-18dp.png',
                                  'SD Bot [deadlines]', botChannel, client);
            
            functions.createEmbed('#0099ff', 'Meetings','List of all upcoming meetings', 
                                  'https://i.ibb.co/VgRkdt8/baseline-schedule-white-18dp.png',
                                  'SD Bot [meetings]', botChannel, client);
        }
    }, MIN_INTERVAL);
});

// Event for checking a week, a day, and an hour before a deadline is due
client.on('ready', () => {
    setInterval(function () {
        const botChannel = client.channels.cache.get(meetings_deadlines);

        let oneWeekDate = new Date();
        oneWeekDate.setDate(oneWeekDate.getDate() + 7);
        let oneWeekLeft = `${('0'+(oneWeekDate.getMonth() + 1)).slice(-2)}/${('0'+oneWeekDate.getDate()).slice(-2)}/${oneWeekDate.getFullYear()}`;

        let oneDayDate = new Date();
        oneDayDate.setDate(oneDayDate.getDate() + 1);
        let oneDayLeft = `${('0'+(oneDayDate.getMonth() + 1)).slice(-2)}/${('0'+oneDayDate.getDate()).slice(-2)}/${oneDayDate.getFullYear()}`;

        let today = new Date();
        today.setHours(today.getHours() - 4);
        let date = `${('0'+(today.getMonth() + 1)).slice(-2)}/${('0'+today.getDate()).slice(-2)}/${today.getFullYear()}`;

        // Loop through JSON file and check if it is a week, a day, and an hour before a deadline is due
        for(deadline in client.deadlines) {
            let _date = client.deadlines[deadline].date;

            if(_date === oneWeekLeft) {
                botChannel.send(`@everyone ${client.deadlines[deadline].name} is due in a week.`)
                .catch(console.error);
            } else if(_date === oneDayLeft) {
                botChannel.send(`@everyone ${client.deadlines[deadline].name} is due in a day.`)
                .catch(console.error);
            }

            if(_date != date) continue;

            let hour = client.deadlines[deadline].time[0] + client.deadlines[deadline].time[1];
            let minute = client.deadlines[deadline].time[3] + client.deadlines[deadline].time[4];
            let meridiem = client.deadlines[deadline].meridiem;

            hour = functions.convert12To24(hour, meridiem);
        
            let _time = `${hour}:${minute}`;
            let oneHourLeft = `${hour-1}:${minute}`;
            let time = `${today.getHours()}:${('0'+today.getMinutes()).slice(-2)}`;

            // Adjusts for when the time is 12:MM AM 
            // Otherwise it would be -1:MM AM
            if((hour - 1) === -1) {
                oneHourLeft = `23:${minute}`;
            }

            if(time === oneHourLeft) {
                botChannel.send(`@everyone ${client.deadlines[deadline].name} is due in an hour.`)
                .catch(console.error);
            } else if(time === _time) {
                functions.deleteEvent(client, 'deadline', deadline);
            }
        }
    }, MIN_INTERVAL);
});

// Event for checking an hour before meetings
client.on('ready', () => {
    setInterval(function () {
        const botChannel = client.channels.cache.get(meetings_deadlines);
        let days = ['SUNDAY', 'MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY'];

        let today = new Date();
        today.setHours(today.getHours() - 4);
        let date = `${('0'+(today.getMonth() + 1)).slice(-2)}/${('0'+today.getDate()).slice(-2)}/${today.getFullYear()}`;
        let day = days[today.getDay()];

        // Loop through JSON file and check each meeting's time
        for(meeting in client.meetings) {
            let _date = client.meetings[meeting].date;

            // If the meeting is weekly, then the format of the the date is different
            // In the form of Monday-Sunday instead of MM/DD/YYYY
            if(client.meetings[meeting].weekly)
                _date = _date.toUpperCase();

            if(_date != date && _date != day) continue;
            
            let hour = client.meetings[meeting].time[0] + client.meetings[meeting].time[1];
            let minute = client.meetings[meeting].time[3] + client.meetings[meeting].time[4];
            let meridiem = client.meetings[meeting].meridiem;

            hour = functions.convert12To24(hour, meridiem);
            
            let _time = `${hour}:${minute}`;
            let oneHourLeft = `${hour-1}:${minute}`;
            let time = `${today.getHours()}:${('0'+today.getMinutes()).slice(-2)}`;

            // Adjusts for when the time is 12:MM AM 
            // Otherwise it would be -1:MM AM
            if((hour - 1) === -1) {
                oneHourLeft = `23:${minute}`;
            }

            if(time === oneHourLeft) {
                botChannel.send("@everyone meeting in an hour.")
                .catch(console.error);
            } else if(time === _time) {
                botChannel.send("@everyone meeting in starts now.")
                .catch(console.error);
                
                // Do not delete weekly meetings
                if(!client.meetings[meeting].weekly) {
                    functions.deleteEvent(client, 'meeting', meeting);
                }
            }
        }
    }, MIN_INTERVAL);
});

// Event for command handler
client.on('message', message => {
	if (!message.content.startsWith(prefix) || message.author.bot) return;

	const args = message.content.slice(prefix.length).trim().split(/ +/);
	const commandName = args.shift().toLowerCase(); 

    console.log(message.content);

    const command = client.commands.get(commandName)
		    || client.commands.find(cmd => cmd.aliases && cmd.aliases.includes(commandName));

    if (!command) return;

    if (command.args && !args.length) {
        let reply = `You didn't provide any arguments, ${message.author}`;

        if(command.usage) {
            reply += `\nThe proper usage would be: \`${prefix}${command.name} ${command.usage}\``;
        }

        return message.channel.send(reply);
    }

    if (!cooldowns.has(command.name)) {
        cooldowns.set(command.name, new Discord.Collection());
    }
    
    const now = Date.now();
    const timestamps = cooldowns.get(command.name);
    const cooldownAmount = (command.cooldown || 3) * 1000;
    
    if (timestamps.has(message.author.id)) {
        const expirationTime = timestamps.get(message.author.id) + cooldownAmount;
    
        if (now < expirationTime) {
            const timeLeft = (expirationTime - now) / 1000;
            return message.reply(`please wait ${timeLeft.toFixed(1)} more second(s) before reusing the \`${command.name}\` command.`);
        }
    }

    timestamps.set(message.author.id, now);
    setTimeout(() => timestamps.delete(message.author.id), cooldownAmount);

    try {
        command.execute(message, args);
    } catch (error) {
        console.error(error);
        message.reply('there was an error trying to execute that command!');
    }
});

client.login(token);
