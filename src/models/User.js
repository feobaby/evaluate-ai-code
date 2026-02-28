const { Model, DataTypes } = require('sequelize');
const bcrypt = require('bcrypt');

const SALT_ROUNDS = 10;

module.exports = (sequelize) => {
  class User extends Model {
    static associate() {}

    async validatePassword(plainPassword) {
      return bcrypt.compare(plainPassword, this.passwordHash);
    }

    toSafeObject() {
      const { id, email, fullName, createdAt, updatedAt } = this.get();
      return { id, email, fullName, createdAt, updatedAt };
    }
  }

  User.init(
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      email: {
        type: DataTypes.STRING(255),
        allowNull: false,
        unique: true,
        validate: { isEmail: true },
      },
      passwordHash: {
        type: DataTypes.STRING(255),
        allowNull: false,
        field: 'password_hash',
      },
      fullName: {
        type: DataTypes.STRING(255),
        allowNull: false,
        field: 'full_name',
      },
    },
    {
      sequelize,
      modelName: 'User',
      tableName: 'users',
      underscored: true,
      timestamps: true,
      defaultScope: {
        attributes: { exclude: ['passwordHash'] },
      },
      scopes: {
        withPassword: {
          attributes: { include: ['passwordHash'] },
        },
      },
    }
  );

  User.beforeCreate(async (user) => {
    if (user.password) {
      user.passwordHash = await bcrypt.hash(user.password, SALT_ROUNDS);
      user.password = undefined;
    }
  });

  return User;
};
