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
                "meridiem" : m.meridiem,
                "weekly" : m.weekly
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

    // Sort the array based on the  
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
                if(entry.weekly) {
                    embed.addField(`(ID:${entry.id}) Weekly Meeting`, `${entry.date} ${entry.time} ${entry.meridiem}`)
                } else {
                    embed.addField(`(ID:${entry.id}) Meeting`, `${entry.date} ${entry.time} ${entry.meridiem}`)
                }
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
        hour = parseInt(hour, 10) + 12;
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

function checkArgsLength(event, length, expected, message) {
    if(length !== expected) {
        let reply = `You didn't the proper arguments, ${message.author}`;
        reply += `\nType !help or !help ${event} for the proper usage.`;
        message.channel.send(reply);
        return false;
    }
    return true;
};

function checkDayFormat(day, message) {
    let day_regex = /[Mon|Tues|Wednes|Thurs|Fri|Satur|Sun]day/i;

    if(!day_regex.test(day)) {
        let reply = `Invalid day format, ${message.author}`;
        reply += `\nExample format: Monday`;
        message.channel.send(reply);
        return false;
    }
    return true;
};

function checkDateFormat(date, message) {
    // Check the pattern to make sure it matches MM/DD/YYYY
    date_regex = /[0-9]{2}\/[0-9]{2}\/[0-9]{4}$/;

    if(!date_regex.test(date)) {
        let reply = `Invalid date format, ${message.author}`;
        reply += `\nExample format: 01/01/2020`
        message.channel.send(reply);
        return false;
    }

    let parts = date.split("/");
    let month = parseInt(parts[0], 10);
    let day = parseInt(parts[1], 10);
    let year = parseInt(parts[2], 10);

    // No point of keeping track of dates that are in the past or do not exist
    if(year < 2020) {
        let reply = `Invalid year, ${message.author}`;
        reply += `\nYears must be 2020 or greater.`
        message.channel.send(reply);
        return false;
    }

    if(month <= 0 || month > 12) {
        let reply = `Invalid date format, ${message.author}`;
        reply += `\nExample format: 01/01/2020`
        message.channel.send(reply);
        return false;
    }

    let daysInMonth = [ 31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31 ];

    // If leap year, adjust February to 29
    if((year % 4 === 0 && year % 100 !== 0) || year % 400 === 0) {
        daysInMonth[1] = 29;
    }

    // Make sure the number of days is within the range of the month
    return day > 0 && day <= daysInMonth[month - 1];
}

function checkTimeFormat(time, message) {
    let time_regex = /(0[1-9]|1[0-2]):[0-5][0-9]/;

    if(!time_regex.test(time)) {
        let reply = `Invalid time format, ${message.author}`;
        reply += `\nExample format: 01:00`
        message.channel.send(reply);
        return false;
    }
    return true;
};

function checkMeridiemFormat(meridiem, message) {
    let meridiem_regex = /AM|PM/i;

    if(!meridiem_regex.test(meridiem)) {
        let reply = `Invalid meridiem format, ${message.author}`;
        reply += `\nExample format: 01:00 PM`
        message.channel.send(reply);
        return false;
    }
    return true;
};

module.exports.createEmbed = createEmbed;
module.exports.convert12To24 = convert12To24;
module.exports.deleteEvent = deleteEvent;
module.exports.checkArgsLength = checkArgsLength;
module.exports.checkDayFormat = checkDayFormat;
module.exports.checkDateFormat = checkDateFormat;
module.exports.checkTimeFormat = checkTimeFormat;
module.exports.checkMeridiemFormat= checkMeridiemFormat;