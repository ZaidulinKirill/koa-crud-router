import getMany from './getMany';
import get from './get';
import count from './count';
import counts from './counts';
import create from './create';
import update from './update';
import removeById from './removeById';
import remove from './remove';
import patch from './patch';

export default ({
  Router, model, prefix,
  searchQuery, removedKey, briefColumns,
  preMatch, preSearch = (_, x) => x,
  preCreate, postCreate,
  preUpdate, postUpdate,
  postGetMany, postGet,
  includedColumns = '',
  prePatch, postPatch,
  roles = [], routeRoles = {},
  getRole = ({ user: { role } }) => role,
  middleware = {}, defaultMiddleware = async (ctx, next) => { await next(); },
}) => {
  const router = new Router({
    prefix,
  });

  const authMiddleware = (route) => {
    const currentRoles = routeRoles[route] || roles;
    return currentRoles
      ? async (ctx, next) => {
        if (currentRoles.includes(getRole(ctx))) {
          await next();
        } else {
          ctx.status = 403;
        }
      }
      : async (ctx, next) => { await next(); };
  };


  router.get('/', authMiddleware('getMany'), middleware.getMany || defaultMiddleware, getMany({
    model, briefColumns, searchQuery, postGetMany, includedColumns, preMatch, preSearch,
  }));
  router.get('/count', authMiddleware('count'), middleware.count || defaultMiddleware, count({ model, searchQuery, preSearch }));
  router.post('/count', authMiddleware('counts'), middleware.count || defaultMiddleware, counts({ model, searchQuery, preSearch }));
  router.get('/:id', authMiddleware('get'), middleware.get || defaultMiddleware, get({ model, postGet }));
  router.post('/', authMiddleware('create'), middleware.create || defaultMiddleware, create({ model, preCreate, postCreate }));
  router.put('/', authMiddleware('update'), middleware.update || defaultMiddleware, update({ model, preUpdate, postUpdate }));
  router.delete('/:id', authMiddleware('removeById'), middleware.remove || defaultMiddleware, removeById({ model, removedKey }));
  router.delete('/', authMiddleware('remove'), middleware.remove || defaultMiddleware, remove({ model, removedKey }));
  router.patch('/:id', authMiddleware('patch'), middleware.patch || defaultMiddleware, patch({ model, prePatch, postPatch }));

  return router;
};
