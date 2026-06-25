require('dotenv').config()

const { Client, GatewayIntentBits } = require('discord.js')
const mineflayer = require('mineflayer')

const LOG_CHANNEL_ID = '1519493165651067113'

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages
  ]
})

client.once('ready', () => {
  console.log(`Discord Ready: ${client.user.tag}`)
})

client.login(process.env.DISCORD_TOKEN)

function sendLog(message) {
  const channel = client.channels.cache.get(LOG_CHANNEL_ID)
  if (channel) channel.send(message).catch(console.error)
}

function startBot() {
  const bot = mineflayer.createBot({
    host: 'x1xc.aternos.me',
    port: 56576,
    username: 'admin'
  })

  bot.on('spawn', () => {
    console.log('Minecraft bot joined')
    sendLog('✅ admin دخل سيرفر ماينكرافت')
bot.on('playerJoined', (player) => {
  if (player.username === bot.username) return
const message =
'§6§l[ عراق بابلون ] §r اهلاً وسهلاً بكم في السيرفر! | §bDiscord: https://discord.gg/EpCyF3A6Up'

bot.once('spawn', () => {
  bot.chat(message)

  setInterval(() => {
    bot.chat(message)
  }, 60 * 60 * 1000)
})
 
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

  bot.on('playerJoined', (player) => {
    if (player.username === bot.username) return
    sendLog(`🟢 ${player.username} دخل السيرفر`)
  })

  bot.on('playerLeft', (player) => {
    if (player.username === bot.username) return
    sendLog(`🔴 ${player.username} خرج من السيرفر`)
  })

  bot.on('chat', (username, message) => {
    if (username === bot.username) return
    sendLog(`💬 ${username}: ${message}`)
  })

  bot.on('end', () => {
    console.log('Reconnecting...')
    sendLog('⚠️ انقطع البوت، جاري إعادة الاتصال...')
    setTimeout(startBot, 10000)
  })

  bot.on('error', (err) => {
    console.log(err)
  })
}

startBot()
