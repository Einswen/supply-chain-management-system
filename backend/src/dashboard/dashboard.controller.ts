import { Body, Controller, Get, Post } from "@nestjs/common";
import { CompanyBarChartDto } from "./dto/company-bar-chart.dto";
import { DashboardService } from "./dashboard.service";

@Controller("dashboard")
export class DashboardController {
  constructor(private readonly dashboardService: DashboardService) {}

  @Get()
  getMetrics() {
    return this.dashboardService.getMetrics();
  }

  @Post("companies/filter")
  getCompaniesByFilter(@Body() query: CompanyBarChartDto) {
    return this.dashboardService.getCompaniesByFilter(query);
  }
}
