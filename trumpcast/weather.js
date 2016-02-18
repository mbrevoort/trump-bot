var request = require('request')

module.exports = function (token) {
  return new Weather(token)
}

function Weather (token) {
  var self = this
  self.token = token

  self.get = function (location, fn) {
    var url = 'http://api.openweathermap.org/data/2.5/weather?q=' + location +
              '&units=metric&APPID=' + self.token
    request({url: url, json: true}, function (error, response, data) {
      if (error) {
        return fn(error)
      }
      if (response.statusCode !== 200) {
        return fn(new Error('unexpected status ' + response.statusCode))
      }
      console.log(data)
      var currentConditions = data.weather[0].description
      var conditionID = data.weather[0].id
      var currentTemp = Math.round(data.main.temp * 1.8 + 32) + '°F'
      fn(null, data.name, currentTemp, currentConditions, conditionID)
    })
  }
}
