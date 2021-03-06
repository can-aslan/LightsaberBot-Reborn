// ======================================================================================================================================================
// Libraries
const { Client, Intents, Channel, MessageEmbed, MessageActionRow, MessageButton  } = require('discord.js');
const currencyConverter = require('currency-converter-lt');
const { handler } = require('vatsim-data-handler');
// const flightdata = require('flight-data');

// Constants
// Color Themes
const BOT_COLOR_THEME = ['#71fef4', '#e50d01', '#9440ba', '#20ff51', '#1104ff'];; // Cyan, Blue, Purple, Red, Green (not in order)
const EXCHANGE_COLOR = '#006e00'; // Green
const ERROR_COLOR = '#8f0000'; // Red
const VATSIM_COLOR = '#90f4ff';

// Command Related
const PREFIX = "L!";
const AVAILABLE_CUR = ["AFN", "ALL", "DZD", "AOA", "ARS", "AMD", "AWG", "AUD", "AZN", "BSD", "BHD", "BBD", "BDT", "BYR", "BZD", "BMD", "BTN", "XBT", "BOB", "BAM", "BWP", "BRL", "BND", "BGN", "BIF", "XPF", "KHR", "CAD", "CVE", "KYD", "FCFA", "CLP", "CLF", "CNY", "CNY", "COP", "CF", "CDF", "CRC", "HRK", "CUC", "CZK", "DKK", "DJF", "DOP", "XCD", "EGP", "ETB", "FJD", "GMD", "GBP", "GEL", "GHS", "GTQ", "GNF", "GYD", "HTG", "HNL", "HKD", "HUF", "ISK", "INR", "IDR", "IRR", "IQD", "ILS", "JMD", "JPY", "JOD", "KZT", "KES", "KWD", "KGS", "LAK", "LBP", "LSL", "LRD", "LYD", "MOP", "MKD", "MGA" , "MWK", "MYR", "MVR", "MRO", "MUR", "MXN", "MDL", "MAD", "MZN", "MMK", "NAD", "NPR", "ANG", "NZD", "NIO", "NGN", "NOK", "OMR", "PKR", "PAB", "PGK", "PYG", "PHP", "PLN", "QAR", "RON", "RUB", "RWF", "SVC", "SAR", "RSD", "SCR", "SLL", "SGD", "SBD", "SOS", "ZAR", "KRW", "VES", "LKR", "SDG", "SRD", "SZL", "SEK", "CHF", "TJS", "TZS", "THB", "TOP", "TTD", "TND", "TMT", "UGX", "UAH", "AED", "USD", "UYU", "UZS", "VND", "XOF", "YER", "ZMW", "ETH", "EUR", "LTC", "TWD", "PEN", "TRY"];
// const FLIGHTDATA_API = process.env['FLIGHTDATA_API_KEY'];

// Discord Related
const client = new Client({intents: [Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_MESSAGES]});
const ACTIVITY_LIST = ["Duel of the Fates", "The Imperial March", "Darth Vader Theme", "Jar Jar Binks", "Obi-Wan Kenobi", "Cantina Band"];

// Miscellaneous
const FT_TO_M = 0.3048;
const KTS_TO_KMH = 1.852;
const S_TO_MS = 1000;
const ACTIVITY_TIME = 30 * S_TO_MS;
// ======================================================================================================================================================

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
  if (!interaction.isCommand() && !interaction.isButton()) return;

  if (!interaction.isCommand() && interaction.customId.substr(0, 11) == 'trackFlight') {
    const callsign = interaction.customId.substr(11);

    handler.getFlightInfo(callsign).then(val => {
      // If VATSIM pilot is not connected to the network or does not exist
      if (!val) {
        const flightErrorEmbed = new MessageEmbed()
        .setColor(ERROR_COLOR)
        .setDescription(`VATSIM flight with callsign ${callsign} does not exist.`);
        
        interaction.reply({ embeds: [flightErrorEmbed], ephemeral: true })
        return;
      }
  
      // Flight is found
  
      // Convert departure and arrival airport ICAO codes to airport names
      // TODO
      
      // Flight information summary
      const groundSpeed = Math.round((val.groundspeed * KTS_TO_KMH) * 10) / 10;
      const flightAltitude = Math.round((val.altitude * FT_TO_M) * 10) / 10;
      
      const flightEmbed = new MessageEmbed()
      .setColor(VATSIM_COLOR)
      .setTitle(`${val.callsign} [${val.flight_plan.departure} -> ${val.flight_plan.arrival}]`)
      .setURL('http://www.vattastic.com/')
      .setDescription(`VATSIM flight with callsign ${callsign} found.`)
      .addFields(
        { name: 'Pilot Name', value: `${val.name}` },
        { name: 'Aircraft Type', value: `${val.flight_plan.aircraft_short}`, inline: true },
    		{ name: 'Departure', value: `${val.flight_plan.departure}`, inline: true },
    		{ name: 'Destination', value: `${val.flight_plan.arrival}`, inline: true },
        { name: 'Altitude', value: `${flightAltitude} m`, inline: true },
    		{ name: 'Ground Speed', value: `${groundSpeed} km/h`, inline: true },
    		{ name: 'Time Remaining (Estimated)', value: `${getFlightRemainingTime(
          val.flight_plan.deptime,
          val.flight_plan.enroute_time,
          val.last_updated.substring(11, 16).replace(':', ''))}`,
          inline: true
        },
        { name: 'Flight Plan Route', value: `${val.flight_plan.route}` }
    	)
      .setTimestamp()
      .setFooter({ text: `Last Updated: ${val.last_updated}` });
      
      interaction.reply({ embeds: [flightEmbed], ephemeral: true })
      return;
    });
  }
  
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
  const userCmd = msgCmd.substr(2).toLowerCase();
  switch (userCmd) {
    // L!help: Displays the list of commands.
    case 'help':
      const helpEmbed = new MessageEmbed()
      .setColor(BOT_COLOR_THEME[Math.floor(Math.random() * BOT_COLOR_THEME.length)])
      .setTitle('List of Commands:')
      .addFields(
        { name: 'L!help', value: 'Displays the list of commands.', inline: true },
        { name: 'L!lightsaber', value: 'Introduction.', inline: true },
        { name: '\u200B', value: '\u200B' },
        { name: '\u200B', value: 'Exchange Rate Related Commands:' },
        { name: 'L!exc', value: 'Displays the latest accessible USD, EUR and GBP to TRY exchange rates.', inline: true },
        { name: 'L!exc list', value: 'Lists the supported currencies for displaying the exchange rates with TRY.', inline: true },
        { name: 'L!exc <CURRENCY>', value: 'Displays the latest accessible <CURRENCY> to TRY exchange rate.', inline: true },
        { name: 'L!exc <CURRENCY> <AMOUNT>', value: 'Displays the latest accessible <AMOUNT> TRY in <CURRENCY>.', inline: true },
        { name: 'L!exc2 <CURRENCY1> <CURRENCY2>', value: 'Displays the latest accessible <CURRENCY1> to <CURRENCY2> exchange rate.', inline: true },
        { name: '\u200B', value: '\u200B' },
        { name: '\u200B', value: 'VATSIM Network Related Commands:' },
        { name: 'L!track <CALLSIGN>', value: 'Access to live tracking of the latest accessible pilot information of VATSIM flight with callsign <CALLSIGN>.', inline: true },
        { name: 'L!pilot <VATSIMID>', value: 'Displays the latest accessible pilot information of VATSIM pilot with ID <VATSIMID>.', inline: true },
        { name: 'L!flight <CALLSIGN>', value: 'Displays the latest accessible active flight information of VATSIM flight with callsign <CALLSIGN>.', inline: true },
        { name: '\u200B', value: '\u200B' },
        { name: '\u200B', value: '"/" Commands:' },
        { name: '/echo', value: 'Echoes your message.', inline: true },
        { name: '/pingus', value: 'Replies with Pongus!', inline: true }
      );
      
      msg.channel.send({embeds: [helpEmbed]});
      break;
    // L!lightsaber: Introduction.
    case 'lightsaber':
      msg.reply({content: `Hello \`${msg.author.username}\`, I am LightsaberBot!`});
      break;
    // L!exc: Displays the latest accessible USD, EUR and GBP to TRY exchange rates.
    // L!exc list: Lists the supported currencies for displaying the exchange rates with TRY.
    // L!exc <CURRENCY>: Displays the latest accessible CURRENCY to TRY exchange rate.
    // L!exc <CURRENCY> <AMOUNT>: Displays the latest accessible <AMOUNT> TRY in <CURRENCY>.
    case 'exc':        
      getExchange(msg, msgArgs[1], msgArgs[2]);
      break;
    // L!exc2 <CURRENCY1> <CURRENCY2>: Displays the latest accessible CURRENCY1 to CURRENCY2 exchange rate.
    case 'exc2':        
      getExchange2(msg, msgArgs[1], msgArgs[2]);
      break;
    // L!track <CALLSIGN>: Access to live tracking of the latest accessible pilot information of VATSIM flight with callsign <CALLSIGN>.
    case 'track':
      trackPilot(msg, msgArgs[1]);
      break;
    // L!pilot <VATSIMID>: Displays the latest accessible pilot information of VATSIM pilot with ID <VATSIMID>.
    case 'pilot':
      getPilot(msg, msgArgs[1]);
      break;
    // L!flight <CALLSIGN>: Displays the latest accessible active flight information of VATSIM flight with callsign <CALLSIGN>.
    case 'flight':
      getFlight(msg, msgArgs[1]);
      break;
    default:
      msg.channel.send({content: "Unrecognized command. Please check `L!help`."});
      break;
  }
});

function trackPilot(msg, callsign) {
  if (!callsign) {
    const trackErrorEmbed = new MessageEmbed()
    .setColor(ERROR_COLOR)
    .setDescription(`Please enter a valid CALLSIGN.`);
    
    msg.channel.send({embeds: [trackErrorEmbed]});
    return;
  }

  const trackEmbed = new MessageEmbed()
  .setColor(VATSIM_COLOR)
  .setTitle('Live VATSIM Flight Tracker')
  .setDescription(`Tracking flight with callsign ${callsign}.`);

  const trackButton = new MessageActionRow()
  .addComponents(
    new MessageButton()
      .setCustomId(`trackFlight${callsign}`)
      .setLabel('Track Flight ??????')
      .setStyle('PRIMARY'),
  );
  
  msg.channel.send({embeds: [trackEmbed], components: [trackButton]});
}

function getFlightRemainingTime(depTime, enrouteTime, curTime) {
  let arrivalTime = parseInt(depTime) + parseInt(enrouteTime);
  let remainingTime = parseInt(arrivalTime) - parseInt(curTime);
  let result = "0000" + remainingTime;

  // Check if minutes > 60
  result = result.substring(result.length - 4);
  let hours = parseInt(result.substring(0, 2));
  let minutes = parseInt(result.substring(2));
  
  if (minutes > 60) {
    minutes = minutes % 60;
    hours++;
  }
  
  return `${hours}h ${minutes}m`;
}

function getPilot(msg, vatsimID) {
  handler.getClientDetails(vatsimID).then(val => {
    // If VATSIM pilot is not connected to the network or does not exist
    if (!val) {
      const pilotErrorEmbed = new MessageEmbed()
      .setColor(ERROR_COLOR)
      .setDescription(`VATSIM pilot with id ${vatsimID} is either not connected to the network or does not exist.`);
      
      msg.channel.send({embeds: [pilotErrorEmbed]});
      return;
    }

    // Pilot is found
    getFlight(msg, val.callsign);
  });
}

function getFlight(msg, callsign) {  
  handler.getFlightInfo(callsign).then(val => {
    // If VATSIM pilot is not connected to the network or does not exist
    if (!val) {
      const flightErrorEmbed = new MessageEmbed()
      .setColor(ERROR_COLOR)
      .setDescription(`VATSIM flight with callsign ${callsign} does not exist.`);
      
      msg.channel.send({embeds: [flightErrorEmbed]});
      return;
    }

    // Flight is found
    // const utc3Hour = toString(convertToUtcPlus3(parseInt(val.last_updated.substr(11, 13))));
    // const lastUpdated = utc3Hour + val.last_updated.substr(13, 19);
    // console.log(val);
    
    // Convert departure and arrival airport ICAO codes to airport names
    // TODO
    
    // Flight information summary
    const groundSpeed = Math.round((val.groundspeed * KTS_TO_KMH) * 10) / 10;
    const flightAltitude = Math.round((val.altitude * FT_TO_M) * 10) / 10;
    
    const flightEmbed = new MessageEmbed()
    .setColor(VATSIM_COLOR)
    .setTitle(`${val.callsign} [${val.flight_plan.departure} -> ${val.flight_plan.arrival}]`)
    .setURL('http://www.vattastic.com/')
    .setDescription(`VATSIM flight with callsign ${callsign} found.`)
    .addFields(
      { name: 'Pilot Name', value: `${val.name}` },
      { name: 'Aircraft Type', value: `${val.flight_plan.aircraft_short}`, inline: true },
  		{ name: 'Departure', value: `${val.flight_plan.departure}`, inline: true },
  		{ name: 'Destination', value: `${val.flight_plan.arrival}`, inline: true },
      { name: 'Altitude', value: `${flightAltitude} m`, inline: true },
  		{ name: 'Ground Speed', value: `${groundSpeed} km/h`, inline: true },
  		{ name: 'Time Remaining (Estimated)', value: `${getFlightRemainingTime(
        val.flight_plan.deptime,
        val.flight_plan.enroute_time,
        val.last_updated.substring(11, 16).replace(':', ''))}`,
        inline: true
      },
      { name: 'Flight Plan Route', value: `${val.flight_plan.route}` }
  	)
    .setTimestamp()
    .setFooter({ text: `Last Updated: ${val.last_updated}` });
    
    msg.channel.send({embeds: [flightEmbed]});
    return;
  });
}

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
    msg.channel.send({embeds: [exchangeEmbed]}).then(sentEmbed => sentEmbed.react('????'));
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
      msg.channel.send({embeds: [exchangeEmbed]}).then(sentEmbed => sentEmbed.react('????'));
    });
    return;
  }
  // --------------------------------------------

  // Check if <AMOUNT> is a number
  if ( !(amount instanceof Number) ) {
    const exchangeErrorEmbed = new MessageEmbed()
    .setColor(ERROR_COLOR)
    .setDescription(`Invalid use. <AMOUNT> must be a number.`);
    
    msg.channel.send({embeds: [exchangeErrorEmbed]});
    return;
  }
  
  // --------------------------------------------
  // l!exc <CURRENCY> <AMOUNT>: Displays the latest accessible <AMOUNT> TRY in <CURRENCY>.
  amount = parseFloat(amount);
  const worthConverter = new currencyConverter({from: "TRY", to: currency, amount: amount});
  const worthCurName = worthConverter.currencyName(currency);
  
  worthConverter.convert().then(function(result) {
    const worthEmbed = new MessageEmbed().setColor(EXCHANGE_COLOR).setTitle(`${amount} Turkish Lira = ${result} ${worthCurName}.`);
    msg.channel.send({embeds: [worthEmbed]}).then(sentEmbed => sentEmbed.react('????'));
  });
  // --------------------------------------------
}

console.log("Trying connection...");
client.login(process.env['TOKEN']);