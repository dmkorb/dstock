var config = {};

let environment = 'development'
// environment = 'staging'
// environment = 'production'

if (environment === 'development') {
	config.HOST_URL = "http://localhost:3010"
} else if (environment === 'staging') {
	config.HOST_URL = ""
} else if (environment === 'production') {
	config.HOST_URL = ""
}

module.exports = config