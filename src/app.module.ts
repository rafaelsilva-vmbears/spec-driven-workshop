import { Module } from '@nestjs/common'
import { APP_FILTER } from '@nestjs/core'
import { ConfigModule } from '@nestjs/config'
import { LoggerModule } from 'nestjs-pino'
import { DrizzleModule } from './adapters/database/drizzle/drizzle.module'
import { TasksController } from './adapters/api/controllers/tasks.controller'
import { AllExceptionsFilter } from './adapters/api/filters/global-exception.filter'

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    DrizzleModule,
    LoggerModule.forRoot({
      pinoHttp: {
        transport:
          process.env.NODE_ENV !== 'production'
            ? {
                target: 'pino-pretty',
                options: {
                  colorize: true,
                  singleLine: true,
                },
              }
            : undefined,
      },
    }),
  ],
  controllers: [TasksController],
  providers: [
    {
      provide: APP_FILTER,
      useClass: AllExceptionsFilter,
    },
  ],
})
export class AppModule {}
