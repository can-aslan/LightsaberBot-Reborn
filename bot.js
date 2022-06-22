// Libraries
const { Client, Intents, Channel, MessageEmbed  } = require('discord.js');
const currencyConverter = require('currency-converter-lt');

// Constants
// Color Themes
const BOT_COLOR_THEME = ['#71fef4', '#e50d01', '#9440ba', '#20ff51', '#1104ff'];; // Cyan, Blue, Purple, Red, Green (not in order)
const EXCHANGE_COLOR = '#006e00'; // Green
const ERROR_COLOR = '#8f0000'; // Red

// Command Related
const PREFIX = "l!";
const AVAILABLE_CUR = ["AFN", "ALL", "DZD", "AOA", "ARS", "AMD", "AWG", "AUD", "AZN", "BSD", "BHD", "BBD", "BDT", "BYR", "BZD", "BMD", "BTN", "XBT", "BOB", "BAM", "BWP", "BRL", "BND", "BGN", "BIF", "XPF", "KHR", "CAD", "CVE", "KYD", "FCFA", "CLP", "CLF", "CNY", "CNY", "COP", "CF", "CDF", "CRC", "HRK", "CUC", "CZK", "DKK", "DJF", "DOP", "XCD", "EGP", "ETB", "FJD", "GMD", "GBP", "GEL", "GHS", "GTQ", "GNF", "GYD", "HTG", "HNL", "HKD", "HUF", "ISK", "INR", "IDR", "IRR", "IQD", "ILS", "JMD", "JPY", "JOD", "KZT", "KES", "KWD", "KGS", "LAK", "LBP", "LSL", "LRD", "LYD", "MOP", "MKD", "MGA" , "MWK", "MYR", "MVR", "MRO", "MUR", "MXN", "MDL", "MAD", "MZN", "MMK", "NAD", "NPR", "ANG", "NZD", "NIO", "NGN", "NOK", "OMR", "PKR", "PAB", "PGK", "PYG", "PHP", "PLN", "QAR", "RON", "RUB", "RWF", "SVC", "SAR", "RSD", "SCR", "SLL", "SGD", "SBD", "SOS", "ZAR", "KRW", "VES", "LKR", "SDG", "SRD", "SZL", "SEK", "CHF", "TJS", "TZS", "THB", "TOP", "TTD", "TND", "TMT", "UGX", "UAH", "AED", "USD", "UYU", "UZS", "VND", "XOF", "YER", "ZMW", "ETH", "EUR", "LTC", "TWD", "PEN", "TRY"];

// Discord Related
const client = new Client({intents: [Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_MESSAGES]});
const ACTIVITY_LIST = ["Duel of the Fates", "The Imperial March", "Darth Vader Theme", "Jar Jar Binks", "Obi-Wan Kenobi", "Cantina Band"];

// Miscellaneous
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

  // COMMANDS
  const userCmd = msgCmd.substr(2);
  switch (userCmd) {
    // l!help: Displays the list of commands.
    case 'help':
      const helpEmbed = new MessageEmbed()
      .setColor(BOT_COLOR_THEME[Math.floor(Math.random() * BOT_COLOR_THEME.length)])
      .setTitle('List of Commands:')
      .addFields(
        { name: 'l!help', value: 'Displays the list of commands.' },
        { name: 'l!lightsaber', value: 'Introduction.' },
        { name: 'l!exc', value: 'Displays the latest accessible USD, EUR and GBP to TRY exchange rates.' },
        { name: 'l!exc list', value: 'Lists the supported currencies for displaying the exchange rates with TRY.' },
        { name: 'l!exc <CURRENCY>', value: 'Displays the latest accessible <CURRENCY> to TRY exchange rate.' },
        { name: 'l!exc <CURRENCY> <AMOUNT>', value: 'Displays the latest accessible <AMOUNT> TRY in <CURRENCY>.' },
        { name: 'l!exc2 <CURRENCY1> <CURRENCY2>', value: 'Displays the latest accessible <CURRENCY1> to <CURRENCY2> exchange rate.' },       
        { name: '/echo', value: 'Echoes your message.' },
        { name: '/pingus', value: 'Replies with Pongus!' }
      );
      
      msg.channel.send({embeds: [helpEmbed]});
      break;
    // l!lightsaber: Introduction.
    case 'lightsaber':
      msg.reply({content: `Hello \`${msg.author.username}\`, I am LightsaberBot!`});
      break;
    // l!exc: Displays the latest accessible USD, EUR and GBP to TRY exchange rates.
    // l!exc list: Lists the supported currencies for displaying the exchange rates with TRY.
    // l!exc <CURRENCY>: Displays the latest accessible CURRENCY to TRY exchange rate.
    // l!exc <CURRENCY> <AMOUNT>: Displays the latest accessible <AMOUNT> TRY in <CURRENCY>.
    case 'exc':        
      getExchange(msg, msgArgs[1], msgArgs[2]);
      break;
    // l!exc2 <CURRENCY1> <CURRENCY2>: Displays the latest accessible CURRENCY1 to CURRENCY2 exchange rate.
    case 'exc2':        
      getExchange2(msg, msgArgs[1], msgArgs[2]);
      break;
    default:
      msg.channel.send({content: "Unrecognized command. Please check `l!help`."});
      break;
  }
});

function getExchange2(msg, currency1, currency2) {
  // --------------------------------------------
  // ERROR: Less than two arguments are given.
  if (!currency1 || !currency2) {
    const argumentErrorEmbed = new MessageEmbed()
    .setColor(ERROR_COLOR)
    .setDescription(`Invalid use.\nCorrect use: l!exc2 <CURRENCY1> <CURRENCY2>\n\n Supported currencies:\n\n ${AVAILABLE_CUR.join(', ')}.`);
    
    msg.channel.send({embeds: [argumentErrorEmbed]});
    return;
  }
  // --------------------------------------------

  currency1 = currency1.toUpperCase();
  currency2 = currency2.toUpperCase();
  
  // --------------------------------------------
  // Either CURRENCY1 or CURRENCY2 is invalid
  if ( !AVAILABLE_CUR.includes(currency1) || !AVAILABLE_CUR.includes(currency2) ) {
    const exchangeErrorEmbed = new MessageEmbed()
    .setColor(ERROR_COLOR)
    .setDescription(`At least one of the currencies you entered is invalid. Supported currencies:\n\n ${AVAILABLE_CUR.join(', ')}.`);
    
    msg.channel.send({embeds: [exchangeErrorEmbed]});
    return;
  }
  // --------------------------------------------

  // --------------------------------------------
  // l!exc2 <CURRENCY1> <CURRENCY2>:
  const curConverter = new currencyConverter({from: currency1, to: currency2, amount: 1});
  const currency1Name = curConverter.currencyName(currency1);
  const currency2Name = curConverter.currencyName(currency2);
  
  curConverter.convert().then(function(result) {
    const exchangeEmbed = new MessageEmbed().setColor(EXCHANGE_COLOR).setTitle(`1 ${currency1Name} = ${result} ${currency2Name}.`);
    msg.channel.send({embeds: [exchangeEmbed]}).then(sentEmbed => sentEmbed.react('💸'));
  });
  // --------------------------------------------
}

function getExchange(msg, currency, amount) {
  // --------------------------------------------
  // l!exc
  if (!currency) {
    const usdConverter = new currencyConverter({from: "USD", to: "TRY", amount: 1});
    const eurConverter = new currencyConverter({from: "EUR", to: "TRY", amount: 1});
    const gbpConverter = new currencyConverter({from: "GBP", to: "TRY", amount: 1});

    const usdName = usdConverter.currencyName("USD");
    const eurName = eurConverter.currencyName("EUR");
    const gbpName = gbpConverter.currencyName("GBP");
    
    usdConverter.convert().then(usd => {
      const usdEmbed = new MessageEmbed().setColor(EXCHANGE_COLOR).setTitle(`1 ${usdName} = ${usd} Turkish Lira.`);
      msg.channel.send({embeds: [usdEmbed]});
    });
    
    eurConverter.convert().then(eur => {
      const eurEmbed = new MessageEmbed().setColor(EXCHANGE_COLOR).setTitle(`1 ${eurName} = ${eur} Turkish Lira.`);
      msg.channel.send({embeds: [eurEmbed]});
    });
    
    gbpConverter.convert().then(gbp => {
      const gbpEmbed = new MessageEmbed().setColor(EXCHANGE_COLOR).setTitle(`1 ${gbpName} = ${gbp} Turkish Lira.`);
      msg.channel.send({embeds: [gbpEmbed]});
    });
    
    return;
  }
  // --------------------------------------------
  
  currency = currency.toUpperCase();

  // --------------------------------------------
  // l!exc list
  if ( currency == "LIST" ) {
    const excListEmbed = new MessageEmbed()
    .setColor(BOT_COLOR_THEME[Math.floor(Math.random() * BOT_COLOR_THEME.length)])
    .setDescription(`Supported currencies:\n\n ${AVAILABLE_CUR.join(', ')}.`);
    
    msg.channel.send({embeds: [excListEmbed]});
    return;
  }
  // --------------------------------------------

  // --------------------------------------------
  // l!exc <CURRENCY>: Invalid <CURRENCY>
  if ( !AVAILABLE_CUR.includes(currency) ) {
    const exchangeErrorEmbed = new MessageEmbed()
    .setColor(ERROR_COLOR)
    .setDescription(`The currency you entered is invalid. Supported currencies:\n\n ${AVAILABLE_CUR.join(', ')}.`);
    
    msg.channel.send({embeds: [exchangeErrorEmbed]});
    return;
  }
  // --------------------------------------------

  // --------------------------------------------
  // l!exc <CURRENCY>:
  if (!amount) {
    const curConverter = new currencyConverter({from: currency, to: "TRY", amount: 1});
    const currencyName = curConverter.currencyName(currency);
    
    curConverter.convert().then(function(result) {
      const exchangeEmbed = new MessageEmbed().setColor(EXCHANGE_COLOR).setTitle(`1 ${currencyName} = ${result} Turkish Lira.`);
      msg.channel.send({embeds: [exchangeEmbed]}).then(sentEmbed => sentEmbed.react('💸'));
    });
    return;
  }
  // --------------------------------------------

  amount = parseFloat(amount);

  // if (amount == NaN || amount == null) amount = 1;
  
  // --------------------------------------------
  // l!exc <CURRENCY> <AMOUNT>: Displays the latest accessible <AMOUNT> TRY in <CURRENCY>.
  const worthConverter = new currencyConverter({from: "TRY", to: currency, amount: amount});
  const worthCurName = worthConverter.currencyName(currency);
  
  worthConverter.convert().then(function(result) {
    const worthEmbed = new MessageEmbed().setColor(EXCHANGE_COLOR).setTitle(`${amount} Turkish Lira = ${result} ${worthCurName}.`);
    msg.channel.send({embeds: [worthEmbed]}).then(sentEmbed => sentEmbed.react('💸'));
  });
  // --------------------------------------------
}

console.log("Trying connection...");
client.login(process.env['TOKEN']);