var Botkit = require('botkit')
var Witbot = require('witbot')
var witbot = Witbot(process.env.WIT_TOKEN)
var getResponse = require('./responses')

var controller = Botkit.slackbot({debug: false})
var token = process.env.SLACK_TOKEN
var bbb

if (token) {
  console.log('Starting in single-team mode')
  controller.on('rtm_close', function () {
    console.log('rtm_close')
  })
  controller.on('rtm_reconnect_failed', function () {
    console.log('RECONNECT failed')
  })
  controller.spawn({
    token: token,
    retry: Infinity
  }).startRTM(function (err, bot, payload) {
    if (err) {
      throw new Error(err)
    }
  })
} else {
  console.log('Starting in Beep Boop multi-team mode')
  bbb = require('beepboop-botkit').start(controller, { debug: true })
}

if (bbb) {
  bbb.on('botkit.rtm.started', function (bot, resource, meta) {
    var slackUserId = resource.SlackUserID

    if (meta.isNew && slackUserId) {
      bot.api.im.open({ user: slackUserId }, function (err, response) {
        if (err) {
          return console.log(err)
        }
        var dmChannel = response.channel.id
        bot.say({channel: dmChannel, text: 'I am the most glorious bot to join your team'})
        bot.say({channel: dmChannel, text: '/invite me to any channel in need of my humble brilliance.'})
      })
    }
  })
}

controller.hears('.*', ['direct_message', 'direct_mention', 'mention'], function (bot, message) {
  witbot.process(message.text).any(function (outcome) {
    if (outcome && outcome.intent) {
      console.log(message.text, ' --> ', outcome.intent)
      getResponse(outcome.intent, function (error, response) {
        if (error) return console.error(error)

        if (outcome.entities && outcome.entities.contact && outcome.entities.contact.length) {
          response = response.replace(/{{person}}/g, outcome.entities.contact[0].value)
        }
        response = response.replace(/{{person}}/g, 'somebody')

        bot.reply(message, response)
      })
    }
  })
})
