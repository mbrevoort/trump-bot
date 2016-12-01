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

controller.hears('load (.*)', ['direct_message'], function (bot, message) {
  var dur = parseInt(message.match[1]) * 1000
  bot.reply(message, `blocking CPU for ${dur}s`);

  var iter = () => {
      if (dur < 0) return
      blockCpuFor(1000)
      dur -= 1000
      setTimeout(iter, 5)
  }
  iter()
})

function blockCpuFor(ms) {
	var now = new Date().getTime();
	var result = 0
	while(true) {
		result += Math.random() * Math.random();
    console.log(result)
		if (new Date().getTime() > now +ms)
			return;
	}
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
