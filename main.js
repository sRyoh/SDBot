const fs = require('fs');
const Discord = require('discord.js');
const { prefix, token, meetings_deadlines } = require('./config.json');

const client = new Discord.Client();
client.commands = new Discord.Collection();
const cooldowns = new Discord.Collection();
client.meetings = require('./meetings.json');
client.deadlines = require('./deadlines.json');

const commandFiles = fs.readdirSync('./commands').filter(file => file.endsWith('.js'));

const MIN_INTERVAL = 60 * 1000;
const DAY_INTERVAL = 10 * 1000; 

for (const file of commandFiles) {
	const command = require(`./commands/${file}`);
	client.commands.set(command.name, command);
}

// Event that signals the bot is running
client.once('ready', () => {
    console.log('SD Bot is online.');
});

// Event that will create an embed for deadlines and meetings every 24 hours
client.on('ready', () => {
    const botChannel = client.channels.cache.get(meetings_deadlines);
    // Create meeting and deadline embeds every 24 hours
    setInterval(() => createEmbed('#9e0000', 'Deadlines','List of all upcoming deadlines',
                                  'https://i.ibb.co/2M6jJkq/baseline-event-white-18dp.png',
                                  'SD Bot [deadlines]', botChannel), DAY_INTERVAL);

    setInterval(() => createEmbed('#0099ff', 'Meetings','List of all upcoming meetings', 
                                  'https://i.ibb.co/VgRkdt8/baseline-schedule-white-18dp.png',
                                  'SD Bot [meetings]', botChannel), DAY_INTERVAL);
});

// Event for checking a week before a deadline is due
client.on('ready', () => {
    // Checks for deadlines every 24 hours
    setInterval(function () {
        const botChannel = client.channels.cache.get(meetings_deadlines);

        let oneWeekLeft = new Date();
        oneWeekLeft.setDate(oneWeekLeft.getDate() + 7);
        let date = `${oneWeekLeft.getMonth() + 1}/${oneWeekLeft.getDate()}/${oneWeekLeft.getFullYear()}`;

        // Loop through JSON file and check if it is a week before a deadline is due
        for(deadline in client.deadlines) {
            let _date = client.deadlines[deadline].date;

            if(_date === date) {
                botChannel.send(`@everyone ${client.deadlines[deadline].name} is due in a week.`)
                .catch(console.error);
            }
        }
    }, DAY_INTERVAL);
});

// Event for checking an hour before meetings
client.on('ready', () => {
    // Checks for meeting's time every 1 minute
    setInterval(function () {
        const botChannel = client.channels.cache.get(meetings_deadlines);

        let today = new Date();
        let date = `${today.getMonth() + 1}/${today.getDate()}/${today.getFullYear()}`;

        // Loop through JSON file and check each meeting's time
        for(meeting in client.meetings) {
            let _date = client.meetings[meeting].date;

            // Skip this meeting if the current date and meeting's date does not match
            if(_date != date) continue;
            
            let hour, minute;
            //                                             <HH>:<MM>
            // Length can vary if the user input as <1-9/10-12>:<00-59>
            if(client.meetings[meeting].time.length === 5) {
                hour = client.meetings[meeting].time[0] + client.meetings[meeting].time[1];
                minute = client.meetings[meeting].time[3] + client.meetings[meeting].time[4];
            } else {
                hour = client.meetings[meeting].time[0];
                minute = client.meetings[meeting].time[2] + client.meetings[meeting].time[3];
            }

            let meridiem = client.meetings[meeting].meridiem;
            // Convert 12H format to 24H format
            if(meridiem === "AM" && hour === "12") {
                hour = 0;
            } else if(meridiem === "PM" && hour < 12) {
                hour = parseInt(hour) + 12;
            }
            
            // REMINDER: this won't work when it is 12AM as it goes to -1
            let _time = `${hour-1}:${minute}`
            let time = (`${today.getHours()}:${('0'+today.getMinutes()).slice(-2)}`);

            if(_time === time) {
                botChannel.send("@everyone meeting in 1 hour.")
                .catch(console.error);
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

function createEmbed(color, title, description, thumbnail, footer, channel) {
    // Create an array of either deadline sor meetings
    // Used for adding fields to the embed to show the deadlines or meetings
    let list = [];
    if(title === 'Meetings') {
        for(meeting in client.meetings) {
            let m = client.meetings[meeting];
            list.push({
                "id" : meeting,
                "date" : m.date,
                "time" : m.time,
                'meridiem' : m.meridiem
            });
        }
    } else if(title === 'Deadlines') {
        for(deadline in client.deadlines) {
            let d = client.deadlines[deadline];
            list.push({
                "id" : deadline,
                "name" : d.name,
                "date" : d.date
            });
        }
    }

    // Sort the array based on the dates
    list.sort(function (a, b) {
        if(title === 'Meetings') {
            return new Date(`${a.date} ${a.time} ${a.meridiem}`) - new Date(`${b.date} ${b.time} ${b.meridiem}`);
        } else if(title === 'Deadlines') {
            let date1 = a.date.split('/');
            let date2 = b.date.split('/');
            return date1[2] - date2[2] || date1[0] - date2[0] || date1[1] - date2[1];
        }
    });

    const embed = new Discord.MessageEmbed()
        .setColor(color)
        .setTitle(title)
        .setURL('http://endlesslearner.com/home') //this doesn't work
        .setAuthor('Senior Design Bot', 'https://i.ibb.co/vxcQxLc/DBicon.png')
        .setDescription(description)
        .setThumbnail(thumbnail)
        .setTimestamp()
        .setFooter(footer)
        if(title === 'Meetings') {
            list.forEach(entry => {
                embed.addField(`(ID:${entry.id}) Meeting`, `${entry.date} ${entry.time} ${entry.meridiem}`)
            });
                channel.send(embed)
                .catch(console.error);
        } else if(title === 'Deadlines') {
            list.forEach(entry => {
                embed.addField(`(ID:${entry.id}) ${entry.name}`, `${entry.date}`)
            });
                channel.send(embed)
                .catch(console.error);
    }
};