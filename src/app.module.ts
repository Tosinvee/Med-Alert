import { Module, ValidationPipe } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { FeaturesModule } from './features/features.module';
import { APP_FILTER, APP_INTERCEPTOR, APP_PIPE } from '@nestjs/core';
import { ExceptionsFilter } from './core/filter/exceptions.filter';
import { ResponseInterceptor } from './core/response/responseInterceptor';

@Module({
  imports: [FeaturesModule],
  controllers: [AppController],
  providers: [
    AppService,
    {
      provide: APP_PIPE,
      useValue: new ValidationPipe({ transform: true }),
    },
    {
      provide: APP_FILTER,
      useValue: ExceptionsFilter,
    },
    {
      provide: APP_INTERCEPTOR,
      useValue: ResponseInterceptor,
    },
  ],
})
export class AppModule {}
