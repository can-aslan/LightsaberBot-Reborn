const { REST } = require('@discordjs/rest');
const { Routes } = require('discord-api-types/v9');

const commands = [
  {
    name: 'pingus',
    description: 'Replies with Pongus!'
  },
  {
    name: 'echo',
    description: 'Echoes your message.'
  }
]; 

const rest = new REST({ version: '9' }).setToken(process.env['TOKEN']);

(async () => {
  try {
    console.log('Started refreshing application (/) commands.');

    await rest.put(
      Routes.applicationGuildCommands(process.env['CLIENT_ID'], process.env['GUILD_ID']),
      { body: commands },
    );

    console.log('Successfully reloaded application (/) commands.');
  } catch (error) {
    console.error(error);
  }
})();
