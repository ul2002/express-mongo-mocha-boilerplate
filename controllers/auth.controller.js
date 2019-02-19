import User from '../models/users.model';
import logger from '../core/logger/app-logger';
import smtpTransport from '../core/mailer/app-mailer';
import { parseRequest } from '../core/utils/helpers';
import * as bcrypt from 'bcryptjs';
import * as jwt from 'jsonwebtoken';
import config from '../config/jwt';
import uuid from 'uuid/v4';
import * as crypto from 'crypto';

import {
  DEV_FIND_FAILED,PROD_FIND_FAILED,NO_TOKEN_PROVIDED,AUTHENTICATION_FAILED,USER_NOT_FOUND,MAIL_FAILED
} from '../core/utils/constants';

const controller = {};

controller.login = async (req, res) => {
    try {
      User.findOne({ email: req.body.email }, function (err, user) {
        if (err) return res.status(500).send(DEV_FIND_FAILED);
        if (!user) return res.status(404).send(USER_NOT_FOUND);
        var passwordIsValid = bcrypt.compareSync(req.body.password, user.password);
        if (!passwordIsValid) return res.status(401).send({ auth: false, token: null });
        var token = jwt.sign({ id: user.user_id }, config.secret, {
          expiresIn: config.expiresIn 
        });
        res.status(200).send({ auth: true, user_id : user.user_id, token: token });
      });
      //res.json(user);
    } catch (err) {
      logger.error(`${DEV_FIND_FAILED} auth- ${err}`);
      res.status(400).json({ error: `${PROD_FIND_FAILED} auth` });
    }
};

controller.me = async (req, res) => {
    try {
      var token = req.headers['x-access-token'];
      if (!token) return res.status(401).send({ auth: false, message: NO_TOKEN_PROVIDED });
      
      jwt.verify(token, config.secret, function(err, decoded) {
        if (err) return res.status(500).send({ auth: false, message: AUTHENTICATION_FAILED });
        console.log(decoded.id);
        User.findOne({user_id: decoded.id}, { password: 0 }, function (err, user) {
          if (err) return res.status(500).send("There was a problem finding the user.");
          if (!user) return res.status(404).send(USER_NOT_FOUND);
          
          res.status(200).send(user);
        });
      });
      //res.json(user);
    } catch (err) {
      logger.error(`${DEV_FIND_FAILED} auth- ${err}`);
      res.status(400).json({ error: `${PROD_FIND_FAILED} auth` });
    }
};

controller.forgotPassword = async (req, res) => {
    try {
     const email = req.body.email;
     let user = await User.findOne({email: email});

     if (!user) 
        return res.status(422).json({ error: USER_NOT_FOUND });

      var token = crypto.randomBytes(20).toString('base64');

      console.log(user);

      user = await User.findOneAndUpdate({ user_id: user.user_id }, { email_token: token, reset_password_expires: Date.now() + 86400000 });
        
      var data = {
        to: user.email,
        from: email,
        template: 'forgot-password-email',
        subject: 'Password help has arrived!',
        context: {
          url: 'http://localhost:3000/auth/reset_password?token=' + token,
          name: user.username
        }
      };

      smtpTransport.sendMail(data, function(err) {
        if (!err) {
          return res.json({ message: 'Kindly check your email for further instructions' });
        } else {
          logger.error(`${MAIL_FAILED} auth- ${err}`);
          return res.status(400).json({ message: 'Error occurs when sending mail' });
        }
      });

    } catch (err) {
      logger.error(`${MAIL_FAILED} auth- ${err}`);
      res.status(400).json({ error: `${PROD_FIND_FAILED} auth` });
    }
};

export default controller;
