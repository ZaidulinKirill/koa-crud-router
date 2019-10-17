import Router from 'koa-router';
import mongoose from 'mongoose';
import crudRouter from 'koa-crud-router';
import { Client, ClientEstateRelationship, Estate } from '../../models';

export default crudRouter({
  Router,
  model: Client,
  prefix: '/clients',
  roles: ['superAdmin', 'manager'],
  searchQuery: ({ request: { query: { search } } }) => ({
    ...search && {
      search,
      $or: [
        { secondName: new RegExp(search, 'i') },
        { firstName: new RegExp(search, 'i') },
        { middleName: new RegExp(search, 'i') },
        { phones: { $elemMatch: { phone: search, isRemoved: { $ne: true }, isFavourite: true } } },
        { emails: { $elemMatch: { email: search, isRemoved: { $ne: true }, isFavourite: true } } },
      ],
    },
  }),
  postGet: async (item) => {
    const isOwner = !!await Estate.findOne({
      ownerClientId: item._id,
      isRemoved: { $ne: true },
    });

    return {
      ...item.toObject(),
      tags: [
        item.relatedClientId ? 'additional' : null,
        isOwner ? 'owner' : null,
      ].filter(x => !!x),
    };
  },
  preSearch: async (ctx, filters) => {
    const {
      estateId, userId, search, phone, ...other
    } = filters;
    const relationships = await ClientEstateRelationship.find({
      estateId,
      isRemoved: { $ne: true },
    });

    const filterByUser = () => {
      if (ctx.isManager) {
        return {
          ...(!search || search.length <= 3) && { userId: mongoose.Types.ObjectId(ctx.user._id) },
        };
      }

      return {};
    };

    return {
      ...other,
      ...filterByUser(),
      ...estateId && {
        _id: {
          $in: relationships.map(x => x.clientId).map(mongoose.Types.ObjectId),
        },
      },
      ...phone && { phones: { $elemMatch: { phone, isRemoved: { $ne: true } } } },
    };
  },
  preCreate: async ({ request: { body }, user }) => ({
    ...body,
    userId: user._id,
    serialNumber: (((
      await Client.findOne().sort({ serialNumber: -1 })) || {}).serialNumber || 0
    ) + 1,
  }),
});
