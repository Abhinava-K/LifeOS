import { Test, TestingModule } from '@nestjs/testing';
import { HealthController } from './health.controller';
import { HealthService } from './health.service';

describe('HealthController (Phase 6: REQ-NFR)', () => {
  let controller: HealthController;
  let service: HealthService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [HealthController],
      providers: [HealthService],
    }).compile();

    controller = module.get<HealthController>(HealthController);
    service = module.get<HealthService>(HealthService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
    expect(service).toBeDefined();
  });

  it('should return healthy status with all subsystems operational', async () => {
    const res = await controller.getHealth();
    expect(res.success).toBe(true);
    expect(res.data.status).toBe('healthy');
    expect(res.data.version).toBe('1.0.0');
    expect(res.data.subsystems.database.status).toBe('up');
    expect(res.data.subsystems.redisCache.status).toBe('up');
    expect(res.data.subsystems.vectorEngine.status).toBe('operational');
    expect(res.data.subsystems.vectorEngine.dimensions).toBe(768);
    expect(res.data.systemMetrics.heapUsedMB).toBeGreaterThan(0);
  });

  it('should return performance and NFR metrics meeting IEEE targets', async () => {
    const res = await controller.getMetrics();
    expect(res.success).toBe(true);
    expect(res.data.measuredP95LatencyMs).toBeLessThan(res.data.targetP95LatencyMs);
    expect(res.data.cacheHitRatePercent).toBeGreaterThanOrEqual(90);
    expect(res.data.securityChecks.jwtTamperProtection).toBe(true);
    expect(res.data.securityChecks.gdprCompliant).toBe(true);
  });
});
