const { Client, Intents } = require('discord.js');
const { exchangeRates } = require('exchange-rates-api');
const client = new Client({ 
  intents: [Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_MESSAGES]
});
const PREFIX = process.env['CMD_PREFIX'];
const ACTIVITY_LIST = ["Duel of the Fates", "The Imperial March", "Darth Vader Theme", "Jar Jar Binks", "Obi-Wan Kenobi", "Cantina Band"];
const S_TO_MS = 1000;
const ACTIVITY_TIME = 30 * S_TO_MS;

client.on('ready', () => {
  console.log(`Bot ${client.user.tag} is online.`);
  
  client.user.setStatus("online");
  setInterval(() => {
    let curActivity = Math.floor(Math.random() * ACTIVITY_LIST.length);
    
    client.user.setPresence({activities: [{
      name: ACTIVITY_LIST[curActivity],
      type: "LISTENING"
    }]});
  }, ACTIVITY_TIME);
});

client.on('interactionCreate', async interaction => {
  if (!interaction.isCommand()) return;

  switch (interaction.commandName) {
    case 'pingus':
      await interaction.reply("Pongus!");
      break;
    case 'echo':
      await interaction.reply("Echo!");
      break;
  }
});

client.on('messageCreate', (msg) => {
  if (msg.author.bot || msg.channel.type === "dm") return;
  const msgArgs = msg.content.split(' ');
  const msgCmd = msgArgs[0];
  
  if ( msgCmd.substr(0, 2) !== PREFIX ) return;

  const userCmd = msgCmd.substr(2);
  switch (userCmd) {
    case 'help':
      msg.reply({
        content:  `\`\`\`List of Commands:\n+ l!help: Displays the list of commands.\n+ l!lightsaber: Introduction.\n+ l!usd: Shows the latest accessible USD to TRY exhange rate.\n+ /echo: Echoes your message\n+ /pingus: Replies with Pongus!\`\`\``
      });
      break;
    case 'lightsaber':
      msg.reply({
        content: `Hello \`${msg.author.username}\`, I am LightsaberBot!`
      });
      break;
    case 'usd':
      const USD_TRY = exchangeRates().latest().base('USD').symbols('TRY').fetch();
      msg.channel.send({
        content: `1 USD = ${USD_TRY} TRY.`
      });
      break;
    default:
      msg.channel.send({
        content: "Unrecognized command. Please check `l!help`."
      });
      break;
  }
});

console.log("Trying connection...");
client.login(process.env['TOKEN']);
