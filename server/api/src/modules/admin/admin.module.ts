import { Module } from '@nestjs/common';
import { AdminCatalogueController } from './admin-catalogue.controller';
import { AdminCatalogueService } from './admin-catalogue.service';
import { AdminCustomersController } from './admin-customers.controller';
import { AdminCustomersService } from './admin-customers.service';

@Module({
  controllers: [AdminCatalogueController, AdminCustomersController],
  providers: [AdminCatalogueService, AdminCustomersService],
})
export class AdminModule {}
