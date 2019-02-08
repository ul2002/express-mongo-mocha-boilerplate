import * as bcrypt from 'bcryptjs';
import * as fs from 'fs';
import * as path from 'path';
import moment from 'moment';

const uploadHandler = require('./uploadHandler');

export const parseRequest = (requestBody, objectKeys) => {
  const result = {};

  objectKeys.forEach((key) => {
    if (requestBody[key]) {
      result[key] = requestBody[key];
    }
  });

  const inputKeys = Object.keys(result);

  return inputKeys.length === 0 ? null : result;
};

export const hashPassword = async (password) => {
  return await new Promise((resolve, reject) => {
    bcrypt.hash(password, 10, (err, hash) => {
      if (err) reject(err);
      resolve(hash);
    });
  });
};


export const createJSONFile = (data, filePrefix) => {
  const dirPath = path.join(__dirname, '../../public');
  const dataStr = JSON.stringify({ data });
  const filename = `${filePrefix}_${moment().format('YYYY-MM-DD_hh:mm:ss')}.json`;
  const filepath = `${dirPath}/${filename}`;
  fs.writeFileSync(filepath, dataStr);
  
  return { path: filepath, name: filename };
};

export const deleteFile = (filePath) => {
  if (fs.existsSync(filePath)) {
    fs.unlinkSync(filePath);
  }
};

export const uploadFile = async (req, res) => {
  const promise = new Promise((resolve, reject) => {
    uploadHandler(req, res, (error) => {
      if (error) {
        return reject(error);
      }
      return resolve(req.file);
    });
  });
  
  return await promise;
};


export const translate =  (text, lang) => {
  const dir = path.join(__dirname, '../../lang/'+lang+'/');
  let dictionary = {};
  let files = fs.readdirSync(dir);

  files.forEach(file => {
    let fileStat = fs.statSync(dir + '/' + file).isDirectory();
    if(!fileStat) {
      let data=fs.readFileSync(`${dir}${file}`, 'utf8');
      let content=JSON.parse(data);
      dictionary = {...dictionary, ...content} ;
    }
  })

  return (text in dictionary) ? dictionary[text] : text;

};
