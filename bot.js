const { Client, Intents, Channel, MessageEmbed  } = require('discord.js');
const currencyConverter = require('currency-converter-lt');

const BOT_COLOR_THEME = ['#71fef4', '#e50d01', '#9440ba', '#20ff51', '#1104ff'];; // Cyan, Blue, Purple, Red, Green (not in order)
const EXCHANGE_COLOR = '#006e00'; // Green
const ERROR_COLOR = '#8f0000';
const AVAILABLE_CUR = ["AFN", "ALL", "DZD", "AOA", "ARS", "AMD", "AWG", "AUD", "AZN", "BSD", "BHD", "BBD", "BDT", "BYR", "BZD", "BMD", "BTN", "XBT", "BOB", "BAM", "BWP", "BRL", "BND", "BGN", "BIF", "XPF", "KHR", "CAD", "CVE", "KYD", "FCFA", "CLP", "CLF", "CNY", "CNY", "COP", "CF", "CDF", "CRC", "HRK", "CUC", "CZK", "DKK", "DJF", "DOP", "XCD", "EGP", "ETB", "FJD", "GMD", "GBP", "GEL", "GHS", "GTQ", "GNF", "GYD", "HTG", "HNL", "HKD", "HUF", "ISK", "INR", "IDR", "IRR", "IQD", "ILS", "JMD", "JPY", "JOD", "KZT", "KES", "KWD", "KGS", "LAK", "LBP", "LSL", "LRD", "LYD", "MOP", "MKD", "MGA" , "MWK", "MYR", "MVR", "MRO", "MUR", "MXN", "MDL", "MAD", "MZN", "MMK", "NAD", "NPR", "ANG", "NZD", "NIO", "NGN", "NOK", "OMR", "PKR", "PAB", "PGK", "PYG", "PHP", "PLN", "QAR", "RON", "RUB", "RWF", "SVC", "SAR", "RSD", "SCR", "SLL", "SGD", "SBD", "SOS", "ZAR", "KRW", "VES", "LKR", "SDG", "SRD", "SZL", "SEK", "CHF", "TJS", "TZS", "THB", "TOP", "TTD", "TND", "TMT", "UGX", "UAH", "AED", "USD", "UYU", "UZS", "VND", "XOF", "YER", "ZMW", "ETH", "EUR", "LTC", "TWD", "PEN"];
const client = new Client({ 
  intents: [Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_MESSAGES]
});
const PREFIX = process.env['CMD_PREFIX'];
const ACTIVITY_LIST = ["Duel of the Fates", "The Imperial March", "Darth Vader Theme", "Jar Jar Binks", "Obi-Wan Kenobi", "Cantina Band"];
const S_TO_MS = 1000;
const ACTIVITY_TIME = 30 * S_TO_MS;
//const ICON_URL = '';

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
      const helpEmbed = new MessageEmbed()
      .setColor(BOT_COLOR_THEME[Math.floor(Math.random() * BOT_COLOR_THEME.length)])
      .setTitle('List of Commands:')
      .addFields(
        { name: 'l!help', value: 'Displays the list of commands.' },
        { name: 'l!lightsaber', value: 'Introduction.' },
        { name: 'l!exc <CURRENCY>', value: 'Displays the latest accessible <CURRENCY> to TRY exhange rate.' },
        { name: '/echo', value: 'Echoes your message.' },
        { name: '/pingus', value: 'Replies with Pongus!' }
      );
      
      msg.channel.send({embeds: [helpEmbed]});
      break;
    case 'lightsaber':
      msg.reply({
        content: `Hello \`${msg.author.username}\`, I am LightsaberBot!`
      });
      break;
    case 'exc':
      getExchange(msg, msgArgs[1]);
      break;
    default:
      msg.channel.send({
        content: "Unrecognized command. Please check `l!help`."
      });
      break;
  }
});

function getExchange(msg, currency = "USD") { // Default currency is set to USD
  currency = currency.toUpperCase();
  
  if ( !AVAILABLE_CUR.includes(currency) ) {
    const exchangeErrorEmbed = new MessageEmbed()
    .setColor(ERROR_COLOR)
    .setDescription(`The currency you entered is invalid. Supported currencies:\n\n ${AVAILABLE_CUR.join(', ')}.`);
    
    msg.channel.send({embeds: [exchangeErrorEmbed]});
    return;
  }
  
  const curConverter = new currencyConverter({
    from: currency,
    to: "TRY",
    amount: 1
  });

  const currencyName = curConverter.currencyName(currency);
  
  curConverter.convert().then(function(result) {
    const exchangeEmbed = new MessageEmbed().setColor(EXCHANGE_COLOR).setTitle(`1 ${currencyName} = ${result} Turkish Lira.`);
    msg.channel.send({embeds: [exchangeEmbed]});
  });
}

console.log("Trying connection...");
client.login(process.env['TOKEN']);
