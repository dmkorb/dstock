import EventManager from "nodejs-event-manager";
// // import config from '../config/config.js'

let manager = null

const initEventManager = () => {
    manager = new EventManager.default({
        // url: config.rabbitUri,
        application: 'dstock-api',
    })
    return manager;
}


const getEventManager = () => {
    if (manager) {
        return manager;
    } else {
      return initEventManager()
    }
}

export {
    initEventManager,
    getEventManager,
}