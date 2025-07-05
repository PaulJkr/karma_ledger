import { SequelizeModuleOptions } from '@nestjs/sequelize';

export const dbConfig: SequelizeModuleOptions = {
  dialect: 'sqlite',
  storage: 'db.sqlite',
  autoLoadModels: true,
  synchronize: true,
  logging: false,
};
