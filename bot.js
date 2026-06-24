const { Client, GatewayIntentBits } = require('discord.js');

const client = new Client({
  intents: [GatewayIntentBits.Guilds]
});

client.once('ready', () => {
  console.log(`Logged in as ${client.user.tag}`);
});

client.login(process.env.MTUxOTQzMzA5NTkzMjE0OTg1NA.Gwnndi.i5zsGfgv77XZ8ra6xofW_EMd1K_n6yANfbIPeQ);
