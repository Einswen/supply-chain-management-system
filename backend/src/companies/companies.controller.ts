import { Body, Controller, Delete, Get, Param, Patch, Post } from "@nestjs/common";
import { CompaniesService } from "./companies.service";
import { CreateCompanyDto, UpdateCompanyDto } from "./dto/company.dto";

@Controller("companies")
export class CompaniesController {
  constructor(private readonly companiesService: CompaniesService) {}

  @Get()
  findAll() {
    return this.companiesService.findAll();
  }

  @Post()
  create(@Body() createCompanyDto: CreateCompanyDto) {
    return this.companiesService.create(createCompanyDto);
  }

  @Patch(":companyCode")
  update(@Param("companyCode") companyCode: string, @Body() updateCompanyDto: UpdateCompanyDto) {
    return this.companiesService.update(companyCode, updateCompanyDto);
  }

  @Delete(":companyCode")
  remove(@Param("companyCode") companyCode: string) {
    return this.companiesService.remove(companyCode);
  }
}
