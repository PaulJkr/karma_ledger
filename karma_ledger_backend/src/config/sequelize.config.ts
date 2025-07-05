import { SequelizeModuleOptions } from '@nestjs/sequelize';
import { ConfigService } from '@nestjs/config';

export const getSequelizeConfig = (
  configService: ConfigService,
): SequelizeModuleOptions => {
  const isProd = configService.get<string>('NODE_ENV') === 'production';

  if (isProd) {
    return {
      dialect: 'postgres',
      host: configService.get<string>('DB_HOST'),
      port: configService.get<number>('DB_PORT'),
      username: configService.get<string>('DB_USER'),
      password: configService.get<string>('DB_PASSWORD'),
      database: configService.get<string>('DB_NAME'),
      autoLoadModels: true,
      synchronize: true,
      logging: false,
      dialectOptions: {
        ssl: {
          require: true,
          rejectUnauthorized: false,
        },
      },
    };
  }

  return {
    dialect: 'sqlite',
    storage: configService.get<string>('SQLITE_STORAGE') || 'db.sqlite',
    autoLoadModels: true,
    synchronize: true,
    logging: true,
  };
};
