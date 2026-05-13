import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { AdminGuard } from '../../common/guards/admin.guard';
import { AnalyticsService } from './analytics.service';
import {
  KpisQueryDto,
  HourlyQueryDto,
  TopProductsQueryDto,
  SalesQueryDto,
} from './dto/analytics-query.dto';

@Controller('admin/analytics')
@UseGuards(AdminGuard)
export class AnalyticsController {
  constructor(private readonly analyticsService: AnalyticsService) {}

  @Get('kpis')
  getKpis(@Query() query: KpisQueryDto) {
    return this.analyticsService.getKpis(query);
  }

  @Get('hourly')
  getHourlySales(@Query() query: HourlyQueryDto) {
    return this.analyticsService.getHourlySales(query);
  }

  @Get('top-products')
  getTopProducts(@Query() query: TopProductsQueryDto) {
    return this.analyticsService.getTopProducts(query);
  }

  @Get('sales')
  getSales(@Query() query: SalesQueryDto) {
    return this.analyticsService.getSales(query);
  }

  @Get('menu-performance')
  getMenuPerformance(@Query() query: SalesQueryDto) {
    return this.analyticsService.getMenuPerformance(query);
  }
}
