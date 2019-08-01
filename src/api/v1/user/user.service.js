const { transaction } = require('objection');
const { ValidationError } = require('../../../error');
const { User, RefreshToken, BlacklistToken } = require('../../../model');

// eslint-disable-next-line arrow-body-style
const doesArchiveNonDisabledUser = (status, user) => {
  return status === User.status.archived && user.status !== User.status.disabled;
};

const blacklistToken = async (userId, { query }) => {
  const refreshTokens = await RefreshToken
    .query(query)
    .where({ userId });

  const blacklistTokenData = refreshTokens.map(token => ({ tokenId: token.id }));

  await BlacklistToken.query(query).insert(blacklistTokenData);
};

const disableUser = async (userId) => {
  await transaction(User.knex(), async (trx) => {
    await User.query(trx)
      .findById(userId)
      .patch({ status: User.status.disabled });

    await blacklistToken(userId, { query: trx });

    await RefreshToken.query(trx)
      .delete()
      .where({ userId });
  });
};

module.exports = class UserService {
  static async listUser(params) {
    const {
      search, status, page, limit, sortBy, sort,
    } = params;

    return User
      .query()
      .skipUndefined()
      .where('email', 'like', (search || undefined) && `%${search}%`)
      .where('status', (status || undefined))
      .omit(['roleId'])
      .eager('[role]')
      .eagerAlgorithm(User.JoinEagerAlgorithm)
      .page(page, limit)
      .orderBy(sortBy, sort);
  }

  static async addUser(userData) {
    return transaction(User.knex(), async (trx) => {
      const newUser = await User.query(trx)
        .allowUpsert('[role]')
        .insertGraph({
          ...userData,
          role: {
            id: userData.role,
          },
        }, {
          relate: true,
        });

      return User.query(trx)
        .findById(newUser.id)
        .eager('[role.[permissions]]')
        .omit(['roleId'])
        .eagerAlgorithm(User.JoinEagerAlgorithm);
    });
  }

  static async getUser(userId) {
    return User.query()
      .findById(userId)
      .eager('[role.[permissions]]')
      .omit(['roleId'])
      .eagerAlgorithm(User.JoinEagerAlgorithm)
      .throwIfNotFound();
  }

  static async updateUser(userId, userData) {
    await transaction(User.knex(), async (trx) => {
      await User.query(trx)
        .allowUpsert('[role]')
        .upsertGraph({
          ...userData,
          id: userId,
          role: userData.role && {
            id: userData.role,
          },
        }, {
          relate: true,
          noInsert: true,
          noUpdate: ['role'],
          noDelete: true,
        });
    });
  }

  static async removeUser(userId) {
    return User.query()
      .deleteById(userId)
      .throwIfNotFound();
  }

  static async updateUserStatus(userId, status, refreshTokenId) {
    const user = await User.query().findById(userId);

    if (doesArchiveNonDisabledUser(status, user)) {
      throw new ValidationError('Can only archive disabled users', {
        status: 'can only archive disabled users',
      });
    }

    if (status === User.status.disabled) {
      await disableUser(userId, refreshTokenId);
    } else {
      await User.query().patch({ status });
    }
  }
};
