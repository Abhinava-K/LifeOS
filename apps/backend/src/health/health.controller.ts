import { Controller, Get } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { HealthService, HealthCheckResult, PerformanceMetrics } from './health.service';

@ApiTags('System Diagnostics & Health (Phase 6: REQ-NFR)')
@Controller('health')
export class HealthController {
  constructor(private readonly healthService: HealthService) {}

  @Get()
  @ApiOperation({ summary: 'Check full system health, subsystem availability, and uptime' })
  @ApiResponse({ status: 200, description: 'System health check details.' })
  async getHealth(): Promise<{ success: boolean; data: HealthCheckResult }> {
    const data = await this.healthService.getHealth();
    return { success: true, data };
  }

  @Get('metrics')
  @ApiOperation({ summary: 'Retrieve system latency, NFR metrics, and security audit status' })
  @ApiResponse({ status: 200, description: 'System performance and security metrics.' })
  async getMetrics(): Promise<{ success: boolean; data: PerformanceMetrics }> {
    const data = await this.healthService.getMetrics();
    return { success: true, data };
  }
}
