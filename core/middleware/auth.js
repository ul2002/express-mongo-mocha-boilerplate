const authenticated = (req, res, next) => {
  /* const { authkey } = req.headers;
  const allowedUrls = ['/', '/doc'];

  if (allowedUrls.indexOf(req.originalUrl) >= 0) {
    return next();
  }

  if (authkey) {
    User.findOne({ token: authkey }, (err, result) => {
      if (result !== null) {
        return next();
      }

      res.status(401).json({ message: UNAUTHORIZED_MESSAGE });
    });
  } else {
    res.status(401).json({ message: UNAUTHORIZED_MESSAGE });
  }*/
  return next();
};

export default authenticated;
