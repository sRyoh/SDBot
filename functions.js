const fs = require('fs');
const Discord = require('discord.js');

function createEmbed(color, title, description, thumbnail, footer, channel, client) {
    client.meetings = require('./meetings.json');
    client.deadlines = require('./deadlines.json');

    let list = [];
    if(title === 'Meetings') {
        for(meeting in client.meetings) {
            let m = client.meetings[meeting];
            list.push({
                "id" : meeting,
                "date" : m.date,
                "time" : m.time,
                "meridiem" : m.meridiem
            });
        }
    } else if(title === 'Deadlines') {
        for(deadline in client.deadlines) {
            let d = client.deadlines[deadline];
            list.push({
                "id" : deadline,
                "name" : d.name,
                "date" : d.date,
                "time" : d.time,
                "meridiem" : d.meridiem
            });
        }
    }

    // Sort the array based on the dates
    list.sort(function (a, b) {
        return new Date(`${a.date} ${a.time} ${a.meridiem}`) - new Date(`${b.date} ${b.time} ${b.meridiem}`);
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
                embed.addField(`(ID:${entry.id}) ${entry.name}`, `${entry.date} ${entry.time} ${entry.meridiem}`)
            });
                channel.send(embed)
                .catch(console.error);
    }
};

function convert12To24(hour, meridiem) {
    if(meridiem === "AM" && hour === "12") {
        hour = 0;
    } else if(meridiem === "PM" && hour < 12) {
        hour = parseInt(hour) + 12;
    }
    return hour;
};

function deleteEvent(client, event, id) {
    client.meetings = require('./meetings.json');
    client.deadlines = require('./deadlines.json');

    if(event === 'meeting') {
        delete client.meetings[id];
        fs.writeFile('./meetings.json', JSON.stringify(client.meetings, null, 4), err => {
            if(err) {
                console.log(err); 
                throw err;
            }
        });
    } else if(event === 'deadline') {
        delete client.deadlines[id];
            fs.writeFile('./deadlines.json', JSON.stringify(client.deadlines, null, 4), err => {
                if(err) { 
                    console.log(err); 
                    throw err;
                }
            });
    }
};

module.exports.createEmbed = createEmbed;
module.exports.convert12To24 = convert12To24;
module.exports.deleteEvent = deleteEvent;