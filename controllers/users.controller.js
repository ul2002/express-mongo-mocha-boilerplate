import User from '../models/users.model';
import logger from '../core/logger/app-logger';
import { parseRequest } from '../core/utils/helpers';
import * as bcrypt from 'bcryptjs';
import * as jwt from 'jsonwebtoken';
import config from '../config/jwt';
import uuid from 'uuid/v4';

import {
  DELETION_FAILED, DELETION_SUCCESS, DEV_CREATION_FAILED, DEV_FIND_FAILED, DEV_FINDALL_FAILED,
  DEV_UPDATE_FAILED, PROD_CREATION_FAILED, PROD_FIND_FAILED, PROD_FINDALL_FAILED,
  PROD_UPDATE_FAILED, EMAIL_EXIST, UNAUTHORIZED_RESSOURCE
} from '../core/utils/constants';

const controller = {};

controller.getAllUser = async (req, res) => {
    try {
      const users = await User.getAll();
      res.json(users);
    } catch (err) {
      logger.error(`${DEV_FINDALL_FAILED} users- ${err}`);
      res.status(400).json({ error: `${PROD_FINDALL_FAILED} users` });
    }
};

controller.getUserByUserId = async (req, res) => {
    try {
      const user = await User.getBy({user_id: req.params.id});
      res.json(user);
    } catch (err) {
      logger.error(`${DEV_FINDALL_FAILED} user- ${err}`);
      res.status(400).json({ error: `${PROD_FINDALL_FAILED} user` });
    }
};

controller.createUser = async (req, res) => {
  const { name, username, email } = req.body;

  const password = bcrypt.hashSync(req.body.password, 8);
  
  const user_id = uuid();

  const user = new User({
    user_id, name, username,email, password
  });

  try {
    let usr = await User.getBy({ email });

    if (usr.length > 0) {
      res.status(422).json({ error: EMAIL_EXIST });
    } else {
      const savedUser = await User.add(user);

      // TODO Send confirmation email

      // create a token
    var token = jwt.sign({ id: user.user_id }, config.secret, {
      expiresIn: config.expiresIn
    });

    res.status(200).send({ auth: true, token: token });

    }
  } catch (err) {
    logger.error(`${DEV_CREATION_FAILED} user - ${err}`);
    res.status(400).json({ error: `${PROD_CREATION_FAILED} user` });
  }
};


controller.updateUser = async (req, res, io) => {
  const id = req.params.id;
  const authUserId = req.userId;
  const user = parseRequest(req.body, User.updateParams);
  let updatedUser = null;

  try {
    if (id !==authUserId) {
      return res.status(403).json({ auth: false, message: UNAUTHORIZED_RESSOURCE });
    }
    if (user !== null) {
      await User.change(id, user);
    }
    updatedUser = await User.get(id);
    res.json(updatedUser);
  } catch (err) {
    logger.error(`${DEV_UPDATE_FAILED} user- ${err}`);
    res.status(400).json({ error: `${PROD_UPDATE_FAILED} user` });
  }
};



controller.deleteUserByUserId = async (req, res) => {
    try {
      if (id !==authUserId) {
        return res.status(403).json({ auth: false, message: UNAUTHORIZED_RESSOURCE });
      }
      const user = await User.delete({user_id: req.params.id});
      res.json(user);
    } catch (err) {
      logger.error(`${DELETION_FAILED} user- ${err}`);
      res.status(400).json({ error: `${DELETION_FAILED} user` });
    }
};


controller.updatePasswordUser = async (req, res, io) => {
    const id = req.params.id;
    const user = parseRequest(req.body, User.updateParams);
    let updatedUser = null;
    
        try {
        // No parameters provided
        if (user !== null && user.password !== null) {
            let currentUser = await User.get(id);

            const isMatch = bcrypt.compareSync(user.ancienpassword, currentUser.password);
            // Verification du mot de passe
            if(isMatch){
                console.log("Correct!")
                user.password = bcrypt.hashSync(user.password, 10);
                //console.log("currentUser: ",currentUser);

                await User.change(id, user);
                updatedUser = await User.get(id);

                // console.log("in DATABASE password: ", updatedUser.password);
                // console.log("in FORM password: ", user.password);

                // console.log("updatedUser: ",updatedUser);
            }else{
                console.log("Not correct!")
                updatedUser = {
                    message: "Your password is not correct."
                };
            }
        }else{
            updatedUser = {
                message: "Any password sent."
            };
        }
        res.json(updatedUser);
        } catch (err) {
            logger.error(`${DEV_UPDATE_FAILED} user- ${err}`);
            res.status(400).json({ error: `${PROD_UPDATE_FAILED} user` });
        }
  };


export default controller;
