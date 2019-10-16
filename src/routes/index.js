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
  preMatch = () => [], preSearch = (_, x) => x,
  preCreate, postCreate,
  preUpdate, postUpdate,
  postGet, includedColumns = '',
  prePatch, postPatch,
  roles, getRole = ({ user: { role } }) => role,
  middleware = {}, defaultMiddleware = async (ctx, next) => { await next(); },
}) => {
  const router = new Router({
    prefix,
  });

  const parseRoles = () => {
    if (typeof roles === 'string') {
      return roles.split(',');
    }
    return roles;
  };

  const authMiddleware = roles
    ? async (ctx, next) => {
      if (parseRoles().includes(getRole(ctx))) {
        await next();
      } else {
        ctx.status = 403;
      }
    }
    : async (ctx, next) => { await next(); };


  router.get('/', authMiddleware, middleware.getMany || defaultMiddleware, getMany({
    model, briefColumns, searchQuery, postGet, includedColumns, preMatch, preSearch,
  }));
  router.get('/count', authMiddleware, middleware.count || defaultMiddleware, count({ model, searchQuery, preSearch }));
  router.post('/count', authMiddleware, middleware.count || defaultMiddleware, counts({ model, searchQuery, preSearch }));
  router.get('/:id', authMiddleware, middleware.get || defaultMiddleware, get({ model }));
  router.post('/', authMiddleware, middleware.create || defaultMiddleware, create({ model, preCreate, postCreate }));
  router.put('/', authMiddleware, middleware.update || defaultMiddleware, update({ model, preUpdate, postUpdate }));
  router.delete('/:id', authMiddleware, middleware.remove || defaultMiddleware, removeById({ model, removedKey }));
  router.delete('/', authMiddleware, middleware.remove || defaultMiddleware, remove({ model, removedKey }));
  router.patch('/:id', authMiddleware, middleware.patch || defaultMiddleware, patch({ model, prePatch, postPatch }));

  return router;
};
