var Airtable = require('airtable')

var AIRTABLE_API_KEY = process.env.AIRTABLE_API_KEY
var AIRTABLE_BASE = process.env.AIRTABLE_BASE

Airtable.configure({
  endpointUrl: 'https://api.airtable.com',
  apiKey: AIRTABLE_API_KEY
})

var base = Airtable.base(AIRTABLE_BASE)

module.exports = function (intent, cb) {
  var result = []
  base('Table 1').select({
    view: intent
  }).eachPage(function page (records, fetchNextPage) {
    records.forEach(function (record) {
      result.push(record.get('Quote'))
    })

    fetchNextPage()
  }, function done (error) {
    if (error) {
      return cb(error)
    }
    if (result.length === 0) {
      return cb(null, '')
    }
    cb(null, result[Math.floor(Math.random() * result.length)])
  })
}
