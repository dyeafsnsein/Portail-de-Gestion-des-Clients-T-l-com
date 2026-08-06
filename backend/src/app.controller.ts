import { Controller, Get } from '@nestjs/common';
import { ApiExcludeController, ApiOperation } from '@nestjs/swagger';

@ApiExcludeController()
@Controller()
export class AppController {
  @Get()
  @ApiOperation({ summary: 'Service metadata and API docs location' })
  root(): { service: string; docs: string } {
    return { service: 'telecom-customer-management-api', docs: '/docs' };
  }
}
