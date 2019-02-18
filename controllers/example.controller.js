import logger from '../core/logger/app-logger';
import * as bcrypt from 'bcryptjs';
import { translate } from '../core/utils/helpers';

import {
  DEV_FINDALL_FAILED,
  DEV_UPDATE_FAILED, PROD_FINDALL_FAILED,
  PROD_UPDATE_FAILED
} from '../core/utils/constants';

const controller = {};

controller.hello =  (req, res) => {
        if (!req.body.name) {
            return res.send('An error occurred: Name is a required paramter');
        }

        const name = req.body.name;
        const lang = req.headers.language || 'en';
        switch(lang) {
            case 'en':
                return res.send('Hello, ' + name)
            break;
            case 'es':
                return res.send('Hola, ' + name)
            break;
            case 'de':
                return res.send('Hallo, ' + name)
            break;
            default:
                return res.send('Error: Invalid Language')
        }
}

controller.getAll =  (req, res) => {
    try {
      res.json(translate('login','fr'));
    } catch (err) {
      logger.error(`${DEV_FINDALL_FAILED} example- ${err}`);
      res.status(400).json({ error: `${PROD_FINDALL_FAILED} example` });
    }
}



export default controller;
