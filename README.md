![dstock.](https://github.com/dmkorb/dstock/blob/main/logo.png?raw=true)


Track all your stock portfolios in one place. 

A live demo can be found [here](https://dstock.dmkorb.com/)

## Getting Started

### Installation

Clone the repo:

```bash
git clone https://github.com/dmkorb/dstock.git
cd dstock/server
```

Set the environment variables:

```bash
cp .env.example .env

# open .env and modify the environment variables (if needed)
```


### Running with Docker

The project depends on Redis and MongoDB to run. There's a start script that will run start all the dependencies and run the app:
```
chmod +x start.sh
./start.sh
```

### Running locally

**Important:** you need to have Node v14+ installed to run locally.

Running locally with hot-reload:

```bash
cd server
yarn run dev

cd ../client
yarn start
```

Running in production mode:

```bash
cd client
yarn build
cd ../server
yarn start
```



## Project Structure

```
server\              # Backend
|-src\
| |--config\         # Environment variables and configuration related things
| |--constants\      # Constants that are used throughout the project
| |--controllers\    # Route controllers (controller layer)
| |--libs\           # External libs initialization (Redis, MongoDB, RabbitMQ)
| |--middlewares\    # Custom express middlewares
| |--models\         # Mongoose models (data layer)
| |--routes\         # Routes
| |--services\       # Business logic (service layer)
| |--utils\          # Utility classes and functions
| |--validations\    # Request data validation schemas
| |--app.js          # Express app
| |--index.js        # App entry point
client\              # Front-end
|-src\
| |--constants\      # Constants that are used throughout the project
| |--containers\     # React reusable components
| |--helpers\        # Misc utils (text formatting, error handling, etc)
| |--services\       # Communication with the backend services
| |--views\          # The app's pages
| |--_nav.js         # Sidebar navigation buttons
| |--App.js          # React App component
| |--index.js        # App entry point
| |--routes.js       # App router
```

## API Documentation

The API definition can be found at 
https://dstock.docs.apiary.io/


### API Endpoints

List of available routes:

**Auth routes**:\
`POST /v1/auth/register` - register\
`POST /v1/auth/login` - login\
`POST /v1/auth/refresh-tokens` - refresh auth tokens\
`POST /v1/auth/forgot-password` - send reset password email\
`POST /v1/auth/reset-password` - reset password

**User routes**:\
`POST /v1/users` - create a user\
`GET /v1/users` - get all users\
`GET /v1/users/:userId` - get user\
`PATCH /v1/users/:userId` - update user\
`DELETE /v1/users/:userId` - delete user

**Portfolio routes**:\
`POST /v1/portfolios` - create a new portfolio\
`GET /v1/portfolios` - get all portfolios for the user\
`GET /v1/portfolios/:id` - get a portfolio\
`PUT /v1/portfolios/:id` - update a portfolio\
`DELETE /v1/portfolios/:id` - delete a portfolio

**Holdings routes**:\
`GET /v1/holdings` - get all holdings for the user\
`GET /v1/holdings/:id` - get a holding with it's updated daily positions\

*Holdings are created automatically when a new trade is created.*

**Trades routes**:\
`GET /v1/trades` - get all trades for the user\
`POST /v1/trades` - create a new trade\

**Stocks routes**:\
`GET /v1/stocks` - searchs for a stock symbol\
`GET /v1/benchmarks` - get's market indexes (S&P500, Dow Jones and NASDAQ)\



## Architecture
### Back-end

The API was built with [Node.js](https://nodejs.org/) and [Express](https://expressjs.com/), using [Mongoose](https://mongoosejs.com/) / [mongoDB](https://www.mongodb.com/) to store data, [Redis](https://redis.io/) for caching external API requests, and JWT authentication using [Passport.js](http://www.passportjs.org/).

Services (business logic) are separated from the Express controller (API requests) in order to simplify the evolution into microservices if needed. Even though they're running under the same process, the concerns are well defined and separated.

The app emits some events to trigger async actions to other services using the [nodejs-event-manager](https://www.npmjs.com/package/nodejs-event-manager) library, although this could easily be replaced with RabbitMQ simply by using the library rabbitmq-event-manager, that shares the same API. An even better solution would be to use Kafka, which handles system failures.


### Front-end
The front end is a React application based on [CoreUI](https://github.com/coreui/coreui-free-react-admin-template) template.

It allows the user to register/login into the app, and manually add his/her trades. Once a trade hsa been created, some charts about the portfolio's performance are displayed, as well as comparisons with market benchmarks.

## Third party services
We're using two data providers for stocks quotes and price history.
* [Alpha Advantage](https://www.alphavantage.co/) is user to get basic company information, current stock price, stock price history and to search for stock symbols.
* [twelvedata](https://twelvedata.com/) is used to get the market indicators history for benchmarking.


## Known issues
* Time series data are only available for days where the market was open, and the daily position is calculated iterating over the time series data.\
Therefore, If a trade is created on a holiday, the holding daily position is not updated with the shares of this particular trade.\
The holding does update the amount of shares, however.
Weekends are safe by checking the day of the week with javascript's `Date` library.

* SELL trade:\
There's no control over the amount of shares the user sells. 
That might lead to negative shares amount if he tries to sell before buying or a quantity greater than the current position.


## TODOs
* Implement sorting `sort_by` on query routes (`GET /portfolios`, `GET /holdings` and `GET /trades`)
* Add Swagger docs
* Add unit/integration tests
