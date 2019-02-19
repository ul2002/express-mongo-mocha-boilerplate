import controller from '../controllers/users.controller';
import authenticated from '../core/middleware/auth';

const routes = (router) => {
  const prefix = `${process.env.API_BASE}users`;

  router.post(`${prefix}`, (req, res) => {
    controller.createUser(req, res);
  });

  router.put(`${prefix}/:id`, authenticated, (req, res) => {
    controller.updateUser(req, res);
  });

  router.get(`${prefix}`, (req, res) => {
    controller.getAllUser(req, res);
  });

  router.get(`${prefix}/:id`, (req, res) => {
    controller.getUserByUserId(req, res);
  });

  router.delete(`${prefix}/:id`, authenticated, (req, res) => {
    controller.deleteUserByUserId(req, res);
  });
  
  router.put(`${prefix}/password/:id`, (req, res) => {
    controller.updatePasswordUser(req, res);
  });

}
export default routes;
