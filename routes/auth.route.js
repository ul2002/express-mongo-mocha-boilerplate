import controller from '../controllers/auth.controller';

const routes = (router) => {
const prefix = `${process.env.API_BASE}auth`;

  router.get(`${prefix}/me`, (req, res) => {
    controller.me(req, res);
  });

  router.post(`${prefix}/login`, (req, res) => {
    controller.login(req, res);
  });

  router.post(`${prefix}/forgot_password`, (req, res) => {
    controller.forgotPassword(req, res);
  });
  
}
export default routes;
