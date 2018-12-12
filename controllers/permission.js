HttpStatus = require('http-status-codes');

function permisionsCheck(list, url, method = null) {

  var exp = new RegExp('(' + list.join('|').replace(/(\/|\.|\-)/g, '\\$1') + ')');

  if (exp.test(url)) return false;
  else return true;
}

var restrictedPermissions = {
  DELETE: Array(),
  GET: Array(),
  PUT: Array(),
  POST: Array()
};

restrictedPermissions.DELETE[10] = ['users'];

restrictedPermissions.PUT[10] = ['users'];

restrictedPermissions.GET = [];

exports.verifyRole = (req, res, next) => {
  try {
    let activeRole = req.user.role;
    let routes = restrictedPermissions[req.method][activeRole];

    if (!routes) {
      return next();
    }

    let grantAccess = permisionsCheck(routes, req.originalUrl);
  
    if (grantAccess) {
      next();
    } else {
      res.status(400).json({"message": "unauthorized"});
    }
  } catch (error) {
    console.log(error);
  }
};

