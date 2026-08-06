import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AccessoriesModule } from './accessories/accessories.module';
import { AppController } from './app.controller';
import { AuthModule } from './auth/auth.module';
import { ContractsModule } from './contracts/contracts.module';
import { PrismaModule } from './prisma/prisma.module';
import { ResourcesModule } from './resources/resources.module';
import { ServicesModule } from './services/services.module';
import { UsersModule } from './users/users.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true, cache: true }),
    PrismaModule,
    AuthModule,
    UsersModule,
    ContractsModule,
    ResourcesModule,
    ServicesModule,
    AccessoriesModule,
  ],
  controllers: [AppController],
})
export class AppModule {}
