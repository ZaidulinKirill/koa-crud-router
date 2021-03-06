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
  preDelete, postDelete,
  roles = [], routeRoles = {},
  preRouter, postRouter,
  postResponse,
  getRole = ({ user }) => (user ? user.role : undefined),
  middleware = {}, defaultMiddleware = async (ctx, next) => { await next(); },
}) => {
  const router = new Router({
    prefix,
  });

  const authMiddleware = (route) => {
    const currentRoles = routeRoles[route] || roles;
    return currentRoles && currentRoles.length
      ? async (ctx, next) => {
        if (currentRoles.includes(getRole(ctx))) {
          await next();
        } else {
          ctx.status = 403;
        }
      }
      : async (ctx, next) => { await next(); };
  };


  if (preRouter) {
    preRouter(router, authMiddleware('custom'));
  }

  router.get('/', authMiddleware('getMany'), middleware.getMany || defaultMiddleware, getMany({
    model, briefColumns, searchQuery, postGetMany, includedColumns, preMatch, preSearch, postResponse,
  }));
  router.get('/count', authMiddleware('count'), middleware.count || defaultMiddleware, count({ model, searchQuery, preSearch }));
  router.post('/count', authMiddleware('counts'), middleware.count || defaultMiddleware, counts({ model, searchQuery, preSearch }));
  router.get('/:id', authMiddleware('get'), middleware.get || defaultMiddleware, get({ model, postGet }));
  router.post('/', authMiddleware('create'), middleware.create || defaultMiddleware, create({ model, preCreate, postCreate }));
  router.put('/', authMiddleware('update'), middleware.update || defaultMiddleware, update({ model, preUpdate, postUpdate }));
  router.delete('/:id', authMiddleware('removeById'), middleware.remove || defaultMiddleware, removeById({
    model, removedKey, preDelete, postDelete,
  }));
  router.delete('/', authMiddleware('remove'), middleware.remove || defaultMiddleware, remove({
    model, removedKey, preDelete, postDelete,
  }));
  router.patch('/:id', authMiddleware('patch'), middleware.patch || defaultMiddleware, patch({ model, prePatch, postPatch }));

  if (postRouter) {
    postRouter(router, authMiddleware('custom'));
  }

  return router;
};
