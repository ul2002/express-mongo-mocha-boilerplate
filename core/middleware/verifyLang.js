const verifyLang = (req, res, next) => {
  var lang = req.headers['language'];
  if( typeof lang == 'undefined' || lang == null )
    global.language = 'en';
  else
  	global.language = lang;
  next();
};

export default verifyLang;