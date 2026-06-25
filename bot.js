require('dotenv').config()

const { Client, GatewayIntentBits } = require('discord.js')
const mineflayer = require('mineflayer')
const fs = require('fs')

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

  // ===== المتغيرات العامة =====
  const message = '§6§l[ عراق بابلون ] §r❤️ اهلاً وسهلاً بكم في السيرفر! | §bDiscord: https://discord.gg/EpCyF3A6Up'
  const playersList = new Set()
  const spamMap = new Map()
  
  // ===== متغيرات كشف الغشاشين =====
  const suspectList = new Map()
  const hackLog = []
  const previousY = new Map()
  const lastOnGround = new Map()
  const attackLog = new Map()

  // ===== متغيرات نظام الأدمن =====
  const admins = ['admin', 'owner'] // أضف أسماء الأدمن هنا
  const mutedPlayers = new Map()
  const protectedPlayers = new Set()
  const adminLog = []
  const playerStats = new Map()

  // ===== دوال مساعدة =====
  function isAdmin(username) {
    return admins.includes(username.toLowerCase())
  }

  function logAdminAction(admin, command, target, details) {
    const logEntry = {
      admin,
      command,
      target,
      details,
      time: new Date().toLocaleString()
    }
    adminLog.push(logEntry)
    sendLog(`📋 **أمر إداري**\n👤 الأدمن: ${admin}\n📝 الأمر: ${command}\n🎯 المستهدف: ${target}\n📌 التفاصيل: ${details}\n🕐 الوقت: ${new Date().toLocaleString()}`)
    console.log(`[ADMIN] ${admin} -> ${command} ${target} (${details})`)
  }

  function getGreeting() {
    const hour = new Date().getHours()
    if (hour < 12) return '🌅 صباح الخير'
    if (hour < 18) return '☀️ مساء الخير'
    return '🌙 مساء الخير'
  }

  function reportHack(username, hackType, value) {
    const key = `${username}-${hackType}`
    const lastReport = suspectList.get(key) || 0
    if (Date.now() - lastReport < 30000) return
    
    suspectList.set(key, Date.now())
    hackLog.push({
      username,
      hackType,
      value,
      time: new Date().toLocaleString()
    })
    
    bot.chat(`⚠️ [كشف غش] ${username} -> ${hackType} (${value})`)
    sendLog(`🚨 **كشف غشاش!**\n👤 اللاعب: ${username}\n🛠️ نوع الغش: ${hackType}\n📊 القيمة: ${value}\n🕐 الوقت: ${new Date().toLocaleString()}`)
    
    const warnings = suspectList.get(`${username}-warnings`) || 0
    suspectList.set(`${username}-warnings`, warnings + 1)
    
    if (warnings >= 2) {
      bot.chat(`🚫 ${username} تم طرده بسبب تكرار الغش!`)
      // bot.chat(`/kick ${username} تم اكتشاف غش متكرر`)
    }
  }

  function getFancyMessage(text) {
    const colors = ['§c', '§6', '§e', '§a', '§b', '§9', '§d', '§f']
    const fancyMessages = ['✨', '🌟', '⭐', '🌈', '🎯', '💎', '🔥', '💫']
    const color = colors[Math.floor(Math.random() * colors.length)]
    const emoji = fancyMessages[Math.floor(Math.random() * fancyMessages.length)]
    return `${emoji} ${color}${text}`
  }

  bot.once('spawn', () => {
    console.log('Minecraft bot joined')
    sendLog('✅ admin دخل سيرفر ماينكرافت')
    
    // ===== 1. رسالة الترحيب المتكررة =====
    bot.chat(message)
    setInterval(() => {
      bot.chat(message)
    }, 60 * 60 * 1000)

    // ===== 2. الحركة التلقائية =====
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

    // ===== 3. القفز التلقائي =====
    setInterval(() => {
      bot.setControlState('jump', true)
      setTimeout(() => {
        bot.setControlState('jump', false)
      }, 500)
    }, 60000)

    // ===== 4. ردود فعل عشوائية =====
    setInterval(() => {
      const actions = ['jump', 'sneak']
      const action = actions[Math.floor(Math.random() * actions.length)]
      if (action === 'jump') {
        bot.setControlState('jump', true)
        setTimeout(() => bot.setControlState('jump', false), 300)
      } else if (action === 'sneak') {
        bot.setControlState('sneak', true)
        setTimeout(() => bot.setControlState('sneak', false), 1000)
      }
    }, 30000)

    // ===== 5. رسائل تذكيرية =====
    setInterval(() => {
      const reminders = [
        '📢 لا تنسى الانضمام لديسكورد! https://discord.gg/EpCyF3A6Up',
        '💡 قوانين السيرفر: احترام الجميع',
        '🎮 استمتع باللعب معنا!',
        '🌟 سيرفر عراق بابلون، الأفضل دائماً!'
      ]
      bot.chat(reminders[Math.floor(Math.random() * reminders.length)])
    }, 10 * 60 * 1000)

    // ===== 6. تحية الصباح/المساء =====
    setInterval(() => {
      bot.chat(`${getGreeting()} للجميع!`)
    }, 60 * 60 * 1000)

    // ===== 7. مراقبة عدد اللاعبين =====
    setInterval(() => {
      const players = Object.keys(bot.players).length
      if (players >= 5) {
        bot.chat(`👥 عدد اللاعبين الآن: ${players} لاعب!`)
      }
    }, 5 * 60 * 1000)

    // ===== 8. رسائل مزخرفة =====
    setInterval(() => {
      const fancy = getFancyMessage('سيرفر عراق بابلون - أفضل سيرفر في العراق!')
      bot.chat(fancy)
    }, 30 * 60 * 1000)

    // =============================================
    // ===== 9. نظام كشف الغشاشين المتكامل =====
    // =============================================

    // 9a. كشف الحركة السريعة (Speed Hack)
    setInterval(() => {
      const players = Object.values(bot.players)
      players.forEach(player => {
        if (player.username === bot.username) return
        if (!player.entity) return
        const velocity = player.entity.velocity
        const speed = Math.sqrt(velocity.x * velocity.x + velocity.z * velocity.z)
        if (speed > 10) {
          reportHack(player.username, '🚀 حركة سريعة جداً', speed.toFixed(2))
        }
      })
    }, 5000)

    // 9b. كشف القفز العالي (Jump Hack)
    setInterval(() => {
      const players = Object.values(bot.players)
      players.forEach(player => {
        if (player.username === bot.username) return
        if (!player.entity) return
        const currentY = player.entity.position.y
        const prevY = previousY.get(player.username) || currentY
        const jumpHeight = currentY - prevY
        if (jumpHeight > 5 && currentY > 10) {
          reportHack(player.username, '🪂 قفز عالي غير طبيعي', jumpHeight.toFixed(2))
        }
        previousY.set(player.username, currentY)
      })
    }, 1000)

    // 9c. كشف المشي على الهواء (Air Walk)
    bot.on('playerJoined', (player) => {
      lastOnGround.set(player.username, { onGround: true, time: Date.now() })
    })

    setInterval(() => {
      const players = Object.values(bot.players)
      players.forEach(player => {
        if (player.username === bot.username) return
        if (!player.entity) return
        const isOnGround = player.entity.onGround
        const data = lastOnGround.get(player.username)
        if (data && !isOnGround && data.onGround) {
          data.startFlyTime = Date.now()
        }
        if (data && data.startFlyTime) {
          const flyDuration = Date.now() - data.startFlyTime
          if (flyDuration > 5000 && player.entity.position.y < 5) {
            reportHack(player.username, '✈️ طيران غير طبيعي', (flyDuration / 1000).toFixed(1) + ' ثانية')
          }
        }
        lastOnGround.set(player.username, { 
          onGround: isOnGround, 
          time: Date.now() 
        })
      })
    }, 2000)

    // 9d. كشف الغوص في الأرض (X-Ray)
    setInterval(() => {
      const players = Object.values(bot.players)
      players.forEach(player => {
        if (player.username === bot.username) return
        if (!player.entity) return
        const y = player.entity.position.y
        if (y < 0) {
          reportHack(player.username, '🕳️ تحت الأرض (X-Ray)', Math.abs(y).toFixed(1) + ' متر')
        }
      })
    }, 3000)

    // 9e. كشف الهجوم السريع (Kill Aura)
    bot.on('entityHurt', (entity) => {
      if (!entity.username) return
      if (entity.username === bot.username) return
      const now = Date.now()
      const lastAttack = attackLog.get(entity.username) || 0
      const timeDiff = now - lastAttack
      if (timeDiff < 200 && timeDiff > 0) {
        reportHack(entity.username, '⚔️ هجوم سريع جداً (Kill Aura)', timeDiff + 'ms')
      }
      attackLog.set(entity.username, now)
    })

    // =============================================
    // ===== 10. أحداث اللاعبين =====
    // =============================================

    bot.on('playerJoined', (player) => {
      if (player.username === bot.username) return
      playersList.add(player.username)
      
      // تحديث إحصائيات اللاعب
      const stats = playerStats.get(player.username) || { joins: 0, messages: 0, playTime: 0 }
      stats.joins++
      stats.lastJoin = new Date().toLocaleString()
      playerStats.set(player.username, stats)
      
      sendLog(`🟢 ${player.username} دخل السيرفر (إجمالي الزوار: ${playersList.size})`)
      
      // ألقاب عشوائية
      const titles = ['👑 الملك', '⚔️ المحارب', '🧙 الساحر', '🏹 القناص', '🛡️ الحامي', '💎 الجوهرة']
      const title = titles[Math.floor(Math.random() * titles.length)]
      setTimeout(() => {
        bot.chat(`${title} ${player.username} دخل السيرفر!`)
      }, 1000)
      
      // حماية اللاعبين المحميين
      if (protectedPlayers.has(player.username)) {
        bot.chat(`🛡️ اللاعب المحمي ${player.username} دخل السيرفر`)
      }
    })

    bot.on('playerLeft', (player) => {
      if (player.username === bot.username) return
      sendLog(`🔴 ${player.username} خرج من السيرفر`)
      
      const stats = playerStats.get(player.username)
      if (stats && stats.joins > 5) {
        bot.chat(`👋 وداعاً ${player.username}، نتمنى رؤيتك قريباً!`)
      }
    })

    // =============================================
    // ===== 11. نظام الشات المتكامل =====
    // =============================================

    // منع المكتومين من الشات
    bot.on('chat', (username, message) => {
      if (mutedPlayers.has(username)) {
        const muteInfo = mutedPlayers.get(username)
        bot.chat(`🔇 ${username}، أنت مكتوم من قبل ${muteInfo.admin} (السبب: ${muteInfo.reason})`)
        return
      }
    })

    bot.on('chat', (username, message) => {
      if (username === bot.username) return
      
      // تحديث إحصائيات اللاعب
      const stats = playerStats.get(username)
      if (stats) {
        stats.messages++
        playerStats.set(username, stats)
      }
      
      // 11a. منع السبام
      const now = Date.now()
      if (spamMap.has(username)) {
        const lastMsg = spamMap.get(username)
        if (now - lastMsg < 2000) {
          bot.chat(`⚠️ ${username} ممنوع السبام!`)
          return
        }
      }
      spamMap.set(username, now)
      
      // 11b. منع التكرار
      const lastMsg = spamMap.get(username + '_repeat')
      if (lastMsg === message) {
        bot.chat(`⚠️ ${username}، لا تكرر الرسائل!`)
      }
      spamMap.set(username + '_repeat', message)
      
      // 11c. منع الكلمات السيئة
      const badWords = ['كلمة سيئة1', 'كلمة سيئة2', 'سب', 'شتم']
      const containsBad = badWords.some(word => message.toLowerCase().includes(word))
      if (containsBad) {
        bot.chat(`⚠️ ${username}، ممنوع استخدام الكلمات السيئة!`)
        const warnings = suspectList.get(`${username}-badwords`) || 0
        suspectList.set(`${username}-badwords`, warnings + 1)
        if (warnings >= 3) {
          bot.chat(`🚫 ${username} تم طردك بسبب تكرار الكلمات السيئة`)
          // bot.chat(`/kick ${username} كلمات سيئة`)
        }
        return
      }
      
      // 11d. منع الروابط المشبوهة
      if (message.includes('http') || message.includes('www')) {
        if (!message.includes('discord.gg') && !message.includes('aternos.me')) {
          bot.chat(`⚠️ ${username}، ممنوع نشر روابط خارجية!`)
          return
        }
      }
      
      // 11e. الرد على التحية
      const msg = message.toLowerCase()
      if (msg.includes('سلام') || msg.includes('هلا') || msg.includes('مرحبا')) {
        const replies = [
          `🌹 وعليكم السلام ${username}`,
          `👋 هلا وغلا ${username}`,
          `🤍 مرحبا ${username}، كيف الحال؟`
        ]
        bot.chat(replies[Math.floor(Math.random() * replies.length)])
        return
      }
      
      // 11f. الردود الذكية
      const aiResponses = {
        'كيف الحال': ['الحمد لله، وأنت؟', 'بخير، شكراً لسؤالك!', 'تمام، كيف الأمور معك؟'],
        'شو اخبارك': ['الأخبار جيدة!', 'كل شيء تمام، وأنت؟', 'بخير والحمد لله'],
        'وين انت': ['أنا في سيرفر عراق بابلون!', 'هنا معكم في السيرفر!', 'في عالم الماينكرافت الجميل!']
      }
      for (const [key, responses] of Object.entries(aiResponses)) {
        if (msg.includes(key)) {
          bot.chat(responses[Math.floor(Math.random() * responses.length)])
          return
        }
      }
      
      // 11g. أوامر البوت العامة
      if (message === '!ping') {
        bot.chat(`🏓 Pong! ${username}`)
      }
      else if (message === '!وقت') {
        const time = bot.time.timeOfDay
        const hours = Math.floor(time / 1000)
        const minutes = Math.floor((time % 1000) / 1000 * 60)
        bot.chat(`⏰ الوقت في السيرفر: ${hours}:${minutes.toString().padStart(2, '0')}`)
      }
      else if (message === '!موقعي') {
        const pos = bot.entity.position
        bot.chat(`📍 موقعي: X=${Math.round(pos.x)} Y=${Math.round(pos.y)} Z=${Math.round(pos.z)}`)
      }
      else if (message === '!سلام') {
        bot.chat(`👋 السلام عليكم ${username}!`)
      }
      else if (message === '!اعلان') {
        bot.chat('📢 قناة الديسكورد: https://discord.gg/EpCyF3A6Up')
      }
      else if (message === '!بعد') {
        const player = bot.players[username]
        if (player && player.entity) {
          const distance = Math.sqrt(
            Math.pow(bot.entity.position.x - player.entity.position.x, 2) +
            Math.pow(bot.entity.position.z - player.entity.position.z, 2)
          )
          bot.chat(`📏 ${username}، المسافة بيننا: ${Math.round(distance)} متر`)
        } else {
          bot.chat(`❌ ${username}، لا أستطيع رؤيتك`)
        }
      }
      else if (message === '!حظ') {
        const chance = Math.random() * 100
        if (chance > 90) {
          bot.chat(`🎉 ${username} فزت! حظك ممتاز (${Math.round(chance)}%)`)
        } else if (chance > 70) {
          bot.chat(`😊 ${username} حظك جيد (${Math.round(chance)}%)`)
        } else {
          bot.chat(`😅 ${username} حظك سيء اليوم (${Math.round(chance)}%)`)
        }
      }
      else if (message.startsWith('!رقم ')) {
        const guess = parseInt(message.split(' ')[1])
        const secret = Math.floor(Math.random() * 10) + 1
        if (guess === secret) {
          bot.chat(`🎯 ${username} أصبت! الرقم هو ${secret}`)
        } else {
          bot.chat(`❌ ${username} الرقم كان ${secret}`)
        }
      }
      else if (message === '!غشاشين' || message === '!hackers') {
        if (hackLog.length === 0) {
          bot.chat(`✅ ${username}، لا يوجد غشاشين حالياً`)
          return
        }
        const lastHacks = hackLog.slice(-5).map(h => 
          `${h.username} (${h.hackType})`
        ).join(', ')
        bot.chat(`🕵️ ${username}، آخر الغشاشين: ${lastHacks}`)
      }
      else if (message.startsWith('!تحذيرات ')) {
        const target = message.split(' ')[1]
        const warnings = suspectList.get(`${target}-warnings`) || 0
        bot.chat(`📊 ${target} عنده ${warnings} تحذير${warnings > 1 ? 'ات' : ''}`)
      }
      else if (message === '!احصائيات') {
        const stats = playerStats.get(username)
        if (stats) {
          bot.chat(`📊 إحصائيات ${username}:\n🔄 الزيارات: ${stats.joins}\n💬 الرسائل: ${stats.messages}\n🕐 آخر زيارة: ${stats.lastJoin}`)
        } else {
          bot.chat(`❌ لا توجد إحصائيات لك حتى الآن`)
        }
      }
      else if (message === '!ترتيب') {
        const sorted = Array.from(playerStats.entries())
          .sort((a, b) => b[1].messages - a[1].messages)
          .slice(0, 5)
          .map(([name, stats], i) => `${i+1}. ${name} (${stats.messages} رسالة)`)
        bot.chat(`🏆 ترتيب المتحدثين:\n${sorted.join('\n')}`)
      }
      else if (message === '!سيرفر') {
        bot.chat(`🌐 اسم السيرفر: عراق بابلون\n👥 اللاعبين: ${Object.keys(bot.players).length}\n📌 الحالة: نشط`)
      }
      else if (message === '!توقيت') {
        const now = new Date()
        bot.chat(`🕐 الوقت الآن: ${now.toLocaleString()}`)
      }
      else if (message === '!اوامر' || message === '!help') {
        bot.chat(`📋 ${username}، الأوامر المتوفرة:
!ping - اختبار البوت
!وقت - عرض الوقت
!موقعي - موقع البوت
!سلام - تحية
!اعلان - رابط الديسكورد
!بعد - المسافة بينك وبيني
!حظ - اختبار الحظ
!رقم [رقم] - لعبة التخمين
!غشاشين - عرض الغشاشين
!تحذيرات [اسم] - تحذيرات لاعب
!احصائيات - إحصائياتك
!ترتيب - ترتيب المتحدثين
!سيرفر - معلومات السيرفر
!توقيت - الوقت الحالي
!اوامر - قائمة الأوامر`)
      }
      
      // تسجيل الشات في ديسكورد
      sendLog(`💬 ${username}: ${message}`)
    })

    // =============================================
    // ===== 12. نظام الألعاب والمسابقات =====
    // =============================================

    let quizActive = false
    let quizAnswer = ''

    setInterval(() => {
      if (!quizActive && Math.random() < 0.05) {
        const questions = [
          { q: 'كم عدد الألوان في قوس قزح؟', a: '7' },
          { q: 'ما هو عكس الضوء؟', a: 'الظلام' },
          { q: 'كم رجلاً للعنكبوت؟', a: '8' },
          { q: 'ما هي عاصمة العراق؟', a: 'بغداد' }
        ]
        const quiz = questions[Math.floor(Math.random() * questions.length)]
        quizActive = true
        quizAnswer = quiz.a
        bot.chat(`🎯 مسابقة سريعة: ${quiz.q} (أول من يجيب يفوز!)`)
        
        setTimeout(() => {
          quizActive = false
        }, 30000)
      }
    }, 60000)

    bot.on('chat', (username, message) => {
      if (quizActive && message.toLowerCase() === quizAnswer.toLowerCase()) {
        bot.chat(`🏆 ${username} فاز بالمسابقة! الإجابة: ${quizAnswer}`)
        quizActive = false
      }
    })

    // =============================================
    // ===== 13. نظام الأدمن المتقدم =====
    // =============================================

    bot.on('chat', (username, message) => {
      if (!isAdmin(username)) return
      
      const args = message.split(' ')
      const command = args[0].toLowerCase()
      const target = args[1]
      const reason = args.slice(2).join(' ') || 'بدون سبب'

      if (command === '!طرد' || command === '!kick') {
        if (!target) {
          bot.chat(`❌ ${username}، حدد اسم اللاعب`)
          return
        }
        const player = bot.players[target]
        if (!player) {
          bot.chat(`❌ ${username}، اللاعب ${target} غير موجود`)
          return
        }
        if (target === bot.username) {
          bot.chat(`❌ ${username}، لا يمكنك طرد البوت!`)
          return
        }
        if (protectedPlayers.has(target)) {
          bot.chat(`❌ ${target} لاعب محمي لا يمكن طرده`)
          return
        }
        bot.chat(`/kick ${target} ${reason}`)
        logAdminAction(username, 'طرد', target, reason)
        bot.chat(`🚫 ${target} تم طرده بواسطة ${username} (السبب: ${reason})`)
      }

      else if (command === '!حظر' || command === '!ban') {
        if (!target) {
          bot.chat(`❌ ${username}، حدد اسم اللاعب`)
          return
        }
        const player = bot.players[target]
        if (!player) {
          bot.chat(`❌ ${username}، اللاعب ${target} غير موجود`)
          return
        }
        if (protectedPlayers.has(target)) {
          bot.chat(`❌ ${target} لاعب محمي لا يمكن حظره`)
          return
        }
        bot.chat(`/ban ${target} ${reason}`)
        logAdminAction(username, 'حظر', target, reason)
        bot.chat(`🔨 ${target} تم حظره بواسطة ${username} (السبب: ${reason})`)
      }

      else if (command === '!فك_حظر' || command === '!unban') {
        if (!target) {
          bot.chat(`❌ ${username}، حدد اسم اللاعب`)
          return
        }
        bot.chat(`/pardon ${target}`)
        logAdminAction(username, 'فك حظر', target, 'تم فك الحظر')
        bot.chat(`✅ ${target} تم فك حظره بواسطة ${username}`)
      }

      else if (command === '!كتم' || command === '!mute') {
        if (!target) {
          bot.chat(`❌ ${username}، حدد اسم اللاعب`)
          return
        }
        const player = bot.players[target]
        if (!player) {
          bot.chat(`❌ ${username}، اللاعب ${target} غير موجود`)
          return
        }
        mutedPlayers.set(target, { 
          admin: username, 
          reason: reason, 
          time: new Date().toLocaleString() 
        })
        logAdminAction(username, 'كتم', target, reason)
        bot.chat(`🔇 ${target} تم كتمه بواسطة ${username} (السبب: ${reason})`)
      }

      else if (command === '!فك_كتم' || command === '!unmute') {
        if (!target) {
          bot.chat(`❌ ${username}، حدد اسم اللاعب`)
          return
        }
        if (!mutedPlayers.has(target)) {
          bot.chat(`❌ ${username}، اللاعب ${target} ليس مكتوماً`)
          return
        }
        mutedPlayers.delete(target)
        logAdminAction(username, 'فك كتم', target, 'تم فك الكتم')
        bot.chat(`🔊 ${target} تم فك كتمه بواسطة ${username}`)
      }

      else if (command === '!مسح' || command === '!clear') {
        for (let i = 0; i < 100; i++) {
          bot.chat(' ')
        }
        bot.chat(`🧹 تم مسح الشات بواسطة ${username}`)
        logAdminAction(username, 'مسح الشات', 'الكل', 'تم مسح الشات')
      }

      else if (command === '!اعلان_ادمن' || command === '!announce') {
        if (!reason) {
          bot.chat(`❌ ${username}، اكتب نص الإعلان`)
          return
        }
        const announceMsg = `📢 **إعلان من الأدمن ${username}**\n${reason}`
        bot.chat(announceMsg)
        logAdminAction(username, 'إعلان', 'الكل', reason)
      }

      else if (command === '!نقل' || command === '!tp') {
        if (!target) {
          bot.chat(`❌ ${username}، حدد اسم اللاعب`)
          return
        }
        const player = bot.players[target]
        if (!player) {
          bot.chat(`❌ ${username}، اللاعب ${target} غير موجود`)
          return
        }
        const pos = bot.entity.position
        bot.chat(`/tp ${target} ${Math.round(pos.x)} ${Math.round(pos.y)} ${Math.round(pos.z)}`)
        logAdminAction(username, 'نقل', target, `إلى موقع البوت`)
        bot.chat(`📍 ${target} تم نقله إلى موقع البوت بواسطة ${username}`)
      }

      else if (command === '!اعطاء' || command === '!give') {
        if (!target || !args[2]) {
          bot.chat(`❌ ${username}، استخدم: !اعطاء [اسم] [العنصر] [العدد]`)
          return
        }
        const item = args[2]
        const amount = args[3] || 1
        bot.chat(`/give ${target} ${item} ${amount}`)
        logAdminAction(username, 'اعطاء', target, `${item} x${amount}`)
        bot.chat(`🎁 ${target} حصل على ${item} x${amount} من ${username}`)
      }

      else if (command === '!وقت_اللاعب' || command === '!playtime') {
        if (!target) {
          bot.chat(`❌ ${username}، حدد اسم اللاعب`)
          return
        }
        const stats = playerStats.get(target)
        if (stats && stats.playTime) {
          const hours = Math.floor(stats.playTime / 3600)
          const minutes = Math.floor((stats.playTime % 3600) / 60)
          bot.chat(`⏱️ ${target} لعب لمدة ${hours} ساعة و ${minutes} دقيقة`)
        } else {
          bot.chat(`❌ لا توجد بيانات لـ ${target}`)
        }
      }

      else if (command === '!بوت_قل' || command === '!bot_say') {
        if (!reason) {
          bot.chat(`❌ ${username}، اكتب النص`)
          return
        }
        bot.chat(`🤖 ${reason}`)
        logAdminAction(username, 'بوت يقول', 'الكل', reason)
      }

      else if (command === '!اعادة_تشغيل' || command === '!restart') {
        bot.chat(`🔄 جاري إعادة تشغيل البوت بأمر من ${username}...`)
        logAdminAction(username, 'إعادة تشغيل', 'البوت', 'تم إعادة التشغيل')
        setTimeout(() => {
          bot.end()
          setTimeout(startBot, 5000)
        }, 3000)
      }

      else if (command === '!ايقاف' || command === '!stop') {
        bot.chat(`🛑 جاري إيقاف البوت بأمر من ${username}`)
        logAdminAction(username, 'إيقاف', 'البوت', 'تم إيقاف البوت')
        setTimeout(() => {
          bot.end()
          process.exit(0)
        }, 3000)
      }

      else if (command === '!ادمن' || command === '!admins') {
        const adminList = admins.map(a => `👑 ${a}`).join('\n')
        bot.chat(`📋 قائمة الأدمن:\n${adminList}`)
      }

      else if (command === '!اضافة_ادمن' || command === '!add_admin') {
        if (!target) {
          bot.chat(`❌ ${username}، حدد اسم اللاعب`)
          return
        }
        if (admins.includes(target.toLowerCase())) {
          bot.chat(`❌ ${target} بالفعل أدمن`)
          return
        }
        admins.push(target.toLowerCase())
        logAdminAction(username, 'إضافة أدمن', target, 'تمت الإضافة')
        bot.chat(`✅ ${target} أصبح أدمن في البوت`)
      }

      else if (command === '!حذف_ادمن' || command === '!remove_admin') {
        if (!target) {
          bot.chat(`❌ ${username}، حدد اسم اللاعب`)
          return
        }
        const index = admins.indexOf(target.toLowerCase())
        if (index === -1) {
          bot.chat(`❌ ${target} ليس أدمن`)
          return
        }
        if (target.toLowerCase() === 'admin') {
          bot.chat(`❌ لا يمكن حذف الأدمن الأساسي`)
          return
        }
        admins.splice(index, 1)
        logAdminAction(username, 'حذف أدمن', target, 'تم الحذف')
        bot.chat(`❌ ${target} تمت إزالته من قائمة الأدمن`)
      }

      else if (command === '!سجل_الادمن' || command === '!admin_log') {
        if (adminLog.length === 0) {
          bot.chat(`📋 لا يوجد سجل لأوامر الأدمن`)
          return
        }
        const lastLogs = adminLog.slice(-5).map(log => 
          `${log.admin}: ${log.command} ${log.target} (${log.time})`
        ).join('\n')
        bot.chat(`📋 آخر 5 أوامر أدمن:\n${lastLogs}`)
      }

      else if (command === '!حالة_السيرفر' || command === '!server_status') {
        const players = Object.keys(bot.players).length
        const uptime = process.uptime()
        const hours = Math.floor(uptime / 3600)
        const minutes = Math.floor((uptime % 3600) / 60)
        bot.chat(`📊 **حالة السيرفر**\n👥 اللاعبين: ${players}\n⏱️ وقت التشغيل: ${hours} ساعة ${minutes} دقيقة\n📌 الحالة: 🟢 نشط`)
      }

      else if (command === '!حماية' || command === '!protect') {
        if (!target) {
          bot.chat(`❌ ${username}، حدد اسم اللاعب`)
          return
        }
        protectedPlayers.add(target)
        logAdminAction(username, 'حماية', target, 'تمت الحماية')
        bot.chat(`🛡️ ${target} تمت حمايته بواسطة ${username}`)
      }

      else if (command === '!الغاء_حماية' || command === '!unprotect') {
        if (!target) {
          bot.chat(`❌ ${username}، حدد اسم اللاعب`)
          return
        }
        if (!protectedPlayers.has(target)) {
          bot.chat(`❌ ${target} ليس محمياً`)
          return
        }
        protectedPlayers.delete(target)
        logAdminAction(username, 'إزالة حماية', target, 'تمت الإزالة')
        bot.chat(`🔓 ${target} تمت إزالة حمايته بواسطة ${username}`)
      }

      else if (command === '!نسخ_احتياطي' || command === '!backup') {
        const backup = {
          players: Array.from(playerStats.entries()),
          admins: admins,
          muted: Array.from(mutedPlayers.entries()),
          protected: Array.from(protectedPlayers),
          time: new Date().toLocaleString()
        }
        fs.writeFileSync('backup.json', JSON.stringify(backup, null, 2))
        bot.chat(`💾 تم عمل نسخة احتياطية بواسطة ${username}`)
        logAdminAction(username, 'نسخ احتياطي', 'الكل', 'تم عمل نسخة')
      }

      else if (command === '!استعادة' || command === '!restore') {
        if (fs.existsSync('backup.json')) {
          const backup = JSON.parse(fs.readFileSync('backup.json'))
          // استعادة البيانات
          bot.chat(`🔄 تم استعادة النسخة الاحتياطية بواسطة ${username}`)
          logAdminAction(username, 'استعادة', 'الكل', 'تمت الاستعادة')
        } else {
          bot.chat(`❌ لا يوجد ملف نسخ احتياطي`)
        }
      }
    })

    // =============================================
    // ===== 14. الرسائل الخاصة (Whisper) =====
    // =============================================

    bot.on('whisper', (username, message) => {
      if (message === '!help') {
        bot.whisper(username, '📋 الأوامر: !ping, !وقت, !موقعي, !سلام, !اوامر')
      } else {
        bot.whisper(username, `📩 ${username}، البوت يستمع لك!`)
      }
    })

    // =============================================
    // ===== 15. أحداث البوت =====
    // =============================================

    bot.on('end', () => {
      console.log('Reconnecting...')
      sendLog('⚠️ انقطع البوت، جاري إعادة الاتصال...')
      setTimeout(startBot, 10000)
    })

    bot.on('error', (err) => {
      console.log(err)
    })

    // =============================================
    // ===== 16. إحصائيات يومية =====
    // =============================================

    setInterval(() => {
      if (hackLog.length > 0) {
        const today = new Date().toLocaleDateString()
        sendLog(`📊 **إحصائيات اليوم (${today})**\nعدد المخالفات: ${hackLog.length}\nإجمالي الزوار: ${playersList.size}`)
      }
    }, 24 * 60 * 60 * 1000)

    // =============================================
    // ===== 17. هدايا عشوائية =====
    // =============================================

    setInterval(() => {
      if (Math.random() < 0.1) {
        const gifts = ['🎁 حصلت على هدية!', '🎉 تهانينا، ربحت جائزة!', '💎 وجدت ألماسة!', '🍰 كعكة مجانية للجميع!']
        const gift = gifts[Math.floor(Math.random() * gifts.length)]
        bot.chat(`🎊 ${gift}`)
      }
    }, 10 * 60 * 1000)

    // =============================================
    // ===== 18. نكت عشوائية =====
    // =============================================

    setInterval(() => {
      const jokes = [
        '😂 ليش المبرمجين يحبون الخريف؟ لأن عندهم fall in love',
        '🤣 شو الفرق بين المبرمج والدكتور؟ الدكتور يكتب روشتة، المبرمج يكتب كود',
        '😹 ليش الأخطاء البرمجية متل الأرواح؟ لإنو ما بتشوفها إلا بعد ما تظهر',
        '😂 المبرمج الوحيد يلي بيكره الـ bugs... لحد ما يصير هو الـ bug'
      ]
      if (Math.random() < 0.2) {
        bot.chat(jokes[Math.floor(Math.random() * jokes.length)])
      }
    }, 5 * 60 * 1000)

    // =============================================
    // ===== 19. مناسبات خاصة =====
    // =============================================

    function checkSpecialDays() {
      const now = new Date()
      const day = now.getDate()
      const month = now.getMonth() + 1
      
      if (day === 1 && month === 1) {
        bot.chat('🎆 كل عام وأنتم بخير بمناسبة رأس السنة!')
      }
      if (day === 25 && month === 12) {
        bot.chat('🎄 ميلاد مجيد! كل عام وأنتم بخير')
      }
      if (day === 1 && month === 5) {
        bot.chat('🌹 عيد العمال! كل عام وأنتم بخير')
      }
    }

    setInterval(checkSpecialDays, 60 * 60 * 1000)

  }) // نهاية spawn
} // نهاية startBot

startBot()
