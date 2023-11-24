const controller = require("../controllers/user.controller");

module.exports = function(app) {
  app.use(function(req, res, next) {
    res.header(
      "Access-Control-Allow-Headers",
      "Origin, Content-Type, Accept"
    );
    next();
  });

  app.post(
    "/api/auth/getinfo",
    controller.getInfoUser
  );

  app.put(
    "/api/auth/updateinfo",
    controller.updateInfo
  );
};