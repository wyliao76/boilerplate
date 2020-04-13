/* global ROOT_PATH */

const path = require('path')

global.ROOT_PATH = path.resolve(__dirname, '../')

global.CONTROLLERS_PATH = path.resolve(ROOT_PATH, 'app/controllers')
global.MODELS_PATH = path.resolve(ROOT_PATH, 'models')
global.SERVICES_PATH = path.resolve(ROOT_PATH, 'services')
global.CONFIGS_PATH = path.resolve(ROOT_PATH, 'config')
