const Discord = require("discord.js");
const mysql = require("mysql");
const moment = require("moment");
const client = new Discord.Client();
const talked = new Set();
const con = mysql.createConnection({
  host: process.env.HOST,
  user: process.env.USER,
  password:  process.env.PASS,
  database:  process.env.DATABASE
});
con.connect(err => {
	if(err) throw err;
  console.log("connected")
})
client.on('ready', () => {
        console.log(`Успешный старт.`)
    client.user.setActivity(`.help`)    
});
function generateXp() {
  let max = 30;
  let min = 5;
  return Math.floor(Math.random() * (max - min + 1)) + min;
}
function generateMon() {
  let max = 20;
  let min = 5;
  return Math.floor(Math.random() * (max - min + 1)) + min;
}
client.on('message', async message => {
	let newxp = Math.floor(Math.random() * (20 - 10 + 1)) + 20;
	 if (talked.has(message.author.id)) return;
	if(message.author.bot) return;
    con.query(`SELECT * FROM Alhena WHERE id = '${message.author.id}'`, (err, rows) => {
	    if(err) throw err;
  let sql;
  if (!rows[0]) {
    con.query(`INSERT INTO Alhena (id, xp, lvl, money, global) VALUES ('${message.author.id}', ${newxp}, '1', '${generateMon()}', '${newxp}')`);
  } else {
    let xp = rows[0].xp;
    con.query(`UPDATE Alhena SET xp = ${xp + newxp} WHERE id = '${message.author.id}'`);
    con.query(`UPDATE Alhena SET money = '${rows[0].money + generateMon()}' WHERE id = '${message.author.id}'`);
    con.query(`UPDATE Alhena SET global = ${rows[0].global + newxp} WHERE id = '${message.author.id}'`);
	  talked.add(message.author.id);
        setTimeout(() => {
          talked.delete(message.author.id);
        }, 60000);
  }
});
	   
})
client.on("message", message => {
	con.query(`SELECT * FROM Alhena WHERE id = '${message.author.id}'`, (err, rows) => {
	if(!rows[0]) return;
	        let lvl = rows[0].lvl;
		let xp = rows[0].xp;
	        const NeedXp = 5 * (rows[0].lvl ^ 2) + 400 * rows[0].lvl + 100;
		if(rows[0].xp < NeedXp) {
		return;
		}
				if(xp >= NeedXp) {
					if(!rows[0]) return;
		con.query(`UPDATE Alhena SET lvl = ${rows[0].lvl+1} WHERE id = '${message.author.id}'`);
		con.query(`UPDATE Alhena SET xp = 0 WHERE id = '${message.author.id}'`);

				}
				});
});
client.on('message', async (message) => {
let prefixes = ['.'];
    let prefix = false;
    prefixes.forEach(prefix_ => {
        if (message.content.startsWith(prefix_)) {
            prefix = prefix_;
        }
    })
        
    if (prefix === false) return;
    const args = message.content.slice(prefix.length).trim().split(/ +/g);
    const command = args.shift().toLowerCase();

	String.prototype.replaceAll = function(search, replacement) {
	let target = this;
	return target.replace(new RegExp(search, 'g'), replacement);
	};
if (['profile'].includes(command)) {
	let user = message.mentions.members.first();
	let id = user.user.id;
	if(!user) {
		message.channel.send(`Укажите пользователя`)
	}
	if(user.user.bot) return message.channel.send("У ботов нет аккаунтов");
con.query(`SELECT * FROM Alhena WHERE id = '${id}'`, (err, rows) => {
	let us = client.users.get(id);
	let lvl = rows[0].lvl;
        let xp = rows[0].xp;
        let money = rows[0].money;
            let NeedXp = 5 * (rows[0].lvl ^ 2) + 400 * rows[0].lvl + 100;
        let totalxp = rows[0].global;
            if(!rows[0]) return message.channel.send(`${user.user.username} не имеет аккаунта, он должен отправить хотя бы 1 сообщение.`);
            message.channel.send({embed: new Discord.RichEmbed()
            	.setTitle(`Профиль пользователя ${us.tag}`)
            	.setColor("#b2ff63")
            	.addField('**XP**', xp+'/'+NeedXp, true)
            	.addField('**LVL**', lvl, true)
				  .addBlankField()
            	.addField('**Total XP**', totalxp, true)
            	.addField('Money', money, true)
				   .setThumbnail(us.avatarURL)
            })
    });
    } else if (['help'].includes(command)) {
	    message.channel.send("```Help panel \n\n\n"+".help - show this message\n" 
				 +".profile - show user profile"+"```")
    }
});
client.login(process.env.TOKEN)
