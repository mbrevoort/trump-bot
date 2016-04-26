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
  bbb.on('add_resource', function (message) {
    var slackTeamId = message.resource.SlackTeamID
    var slackUserId = message.resource.SlackUserID
    console.log('add_resource', slackTeamId, slackUserId, message)

    setTimeout(function () {
      if (message.IsNew && slackUserId) {
        var bot = bbb.botByTeamId(slackTeamId)
        if (!bot) {
          return console.log('Error looking up botkit bot for team %s', slackTeamId)
        }

        console.log('starting private conversation with ', slackUserId)
        bot.startPrivateConversation({user: slackUserId}, function (err, convo) {
          if (err) {
            return console.log(err)
          }

          convo.say('I the most glorious bot that has just joined your team')
          convo.say('You must now /invite me to a channel so that I may show you how dumb you are')
          convo.next()
        })
      }
    }, 5000)
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
