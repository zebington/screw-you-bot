const Discord = require('discord.js');
const auth = fs.existsSync('./auth.json') ? require('./auth.json') : process.env.DISCORD_API_KEY;
const shouts = require('./shouts.json')
const https = require('https');
const jsdom = require('jsdom');
const {
    JSDOM
} = jsdom;

const client = new Discord.Client();

sendReply = (msg, args, reply) => {
    // Find who we're insulting
    const insulting = [
        ...msg.mentions.users.map(val => val.toString()),
        ...args.slice(1).filter(val => val[0] !== '<')
    ];

    // Concatenate the insult
    let message = `${msg.author.toString()} ${shouts.insults[Math.round(Math.random()*(shouts.insults.length-1))]}`;
    if (insulting.length > 0) {
        message += ' at';
        if (insulting.length === 1) {
            message += ` ${insulting[0]}`
        } else if (insulting.length === 2) {
            message += ` ${insulting[0]} and ${insulting[1]}`
        } else {
            for (let i = 0; i < insulting.length - 1; i++) {
                message += ` ${insulting[i]},`
            }
            message += ` and ${insulting[insulting.length - 1]}`
        }
    }
    message += `, "You ${reply}`
    if (insulting.length > 1) message += 's';
    message += '!"';

    msg.delete().then(msg => msg.channel.send(message));
}

client.on('ready', () => {
    console.log('Connected');
    console.log('Logged in as: ' + client.user.username + ' - (' + client.user.id + ')');
});

client.on('message', msg => {
    const args = msg.content.split(' ');
    if (args[0] === '!insult') {
        // Generate insult
        https.get('https://www.robietherobot.com/insult-generator.htm', resp => {
            let data = '';
            resp.on('data', chunk => {
                data += chunk
            });
            resp.on('end', () => {
                const html = new JSDOM(data);
                sendReply(
                    msg, args,
                    html.window.document.querySelectorAll('h1')[1].textContent.substring(6)
                    .replace(/  /g, ' ').toLocaleLowerCase()
                );

            })
        }).on('error', err => {
            console.log("Error: " + err.message);
            sendReply(msg, args, "I couldn't think of one :(");
        });
    }
});

client.login(auth.token);
