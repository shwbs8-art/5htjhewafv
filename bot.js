require('dotenv').config()

const { Client, GatewayIntentBits } = require('discord.js')
const mineflayer = require('mineflayer')

const client = new Client({
  intents: [GatewayIntentBits.Guilds]
})

client.once('ready', () => {
  console.log(`Discord Ready: ${client.user.tag}`)
})

client.login(process.env.DISCORD_TOKEN)

function startBot() {
  const bot = mineflayer.createBot({
    host: 'x1xc.aternos.me',
    port: 56576,
    username: 'admin'
  })

  bot.on('spawn', () => {
    console.log('Minecraft bot joined')

    let moveRight = true

    setInterval(() => {

      if (moveRight) {
        bot.setControlState('right', true)

        setTimeout(() => {
          bot.setControlState('right', false)
        }, 3000)

      } else {
        bot.setControlState('left', true)

        setTimeout(() => {
          bot.setControlState('left', false)
        }, 3000)
      }

      moveRight = !moveRight

      bot.look(
        Math.random() * Math.PI * 2,
        (Math.random() - 0.5) * 0.5,
        true
      )

    }, 20000)

    setInterval(() => {
      bot.setControlState('jump', true)

      setTimeout(() => {
        bot.setControlState('jump', false)
      }, 500)
    }, 60000)
  })

  bot.on('end', () => {
    console.log('Reconnecting...')
    setTimeout(startBot, 10000)
  })

  bot.on('error', console.log)
}

startBot()
