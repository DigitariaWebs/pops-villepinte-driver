import { Module } from '@nestjs/common';
import { AdminCatalogueController } from './admin-catalogue.controller';
import { AdminCatalogueService } from './admin-catalogue.service';
import { AdminCustomersController } from './admin-customers.controller';
import { AdminCustomersService } from './admin-customers.service';
import { AdminDriversController } from './admin-drivers.controller';
import { AdminDriversService } from './admin-drivers.service';
import { DriverSelfController } from './driver-self.controller';

@Module({
  controllers: [
    AdminCatalogueController,
    AdminCustomersController,
    AdminDriversController,
    DriverSelfController,
  ],
  providers: [
    AdminCatalogueService,
    AdminCustomersService,
    AdminDriversService,
  ],
})
export class AdminModule {}
