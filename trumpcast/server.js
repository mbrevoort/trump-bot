var Botkit = require('botkit')
var weather = require('./weather')(process.env.OPENWEATHER_KEY)
var controller = Botkit.slackbot({ debug: false })

controller.spawn({ token: process.env.SLACK_TOKEN }).startRTM(function (err, bot, payload) {
  if (err) throw new Error('Error connecting to slack: ', err)
  console.log('Connected to Slack')
})

controller.hears('^What is the weather in (.*)', 'ambient,direct_message', function (bot, message) {
  var location = message.match[1]
  weather.get(location, function (error, name, temp, condition, code) {
    if (error) return bot.reply(message, 'Uh oh! ' + error)
    bot.reply(message, getMessage(name, temp, condition, code))
  })
})

function getMessage (name, temp, condition, code) {
  // thunderstorm
  if (code >= 200 && code < 300) {
    return name + ' is a big loser! *' + temp + '* and *' + condition + '*.'
  }
  // rain
  if (code >= 300 && code < 600) {
    return name + ' is like Jeb Bush, a dud. *' + temp + '* and *' + condition + '*.'
  }
  // snow
  if (code >= 600 && code < 700) {
    return 'I love watching ' + name + ' fail. *' + temp + '* and *' + condition + '*.'
  }
  // clear
  if (code >= 800 && code < 802) {
    return name + ' is beautiful like my daughter Ivanka: *' + temp + '* and *' + condition + '*.'
  }
  // and clouds
  if (code >= 802 && code < 900) {
    return name + '\'s got a lot of problems! ' + name + '. *' + temp + '* and *' + condition + '*.'
  }
  // etc
  return 'I don\'t like losers. ' + name + ' is *' + temp + '* and *' + condition + '*.'
}
