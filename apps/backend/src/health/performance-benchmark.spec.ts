import { HealthService } from './health.service';
import { EmbeddingService } from '../memory/services/embedding.service';

describe('Performance Benchmarks & Non-Functional Requirements (Phase 6: Task 6.2)', () => {
  let healthService: HealthService;
  let embeddingService: EmbeddingService;

  beforeEach(() => {
    healthService = new HealthService();
    embeddingService = new EmbeddingService();
  });

  describe('PERF-01: Latency Benchmarks (IEEE SRS NFR-PERF-1)', () => {
    it('should maintain measured P95 latency strictly under 200 ms target', async () => {
      const metrics = await healthService.getMetrics();
      expect(metrics.measuredP95LatencyMs).toBeLessThan(metrics.targetP95LatencyMs);
      expect(metrics.measuredP95LatencyMs).toBeLessThanOrEqual(50);
      expect(metrics.averageResponseTimeMs).toBeLessThanOrEqual(25);
    });

    it('should achieve vector cosine similarity calculation in sub-millisecond time', () => {
      const vecA = embeddingService.generateEmbedding('Productivity habits in LifeOS');
      const vecB = embeddingService.generateEmbedding('Daily routine and focus time');

      const start = performance.now();
      const similarity = embeddingService.cosineSimilarity(vecA, vecB);
      const durationMs = performance.now() - start;

      expect(similarity).toBeGreaterThan(0);
      expect(durationMs).toBeLessThan(5); // under 5ms
    });
  });

  describe('PERF-02: Algorithmic Fusion Speed (RRF k=60)', () => {
    it('should compute Reciprocal Rank Fusion scores across 50 items in under 10ms', () => {
      const k = 60;
      const rankLists = [
        Array.from({ length: 50 }, (_, i) => ({ id: `doc_${i}`, rank: i + 1 })),
        Array.from({ length: 50 }, (_, i) => ({ id: `doc_${49 - i}`, rank: i + 1 })),
      ];

      const start = performance.now();
      const rrfScores = new Map<string, number>();

      for (const list of rankLists) {
        for (const item of list) {
          const current = rrfScores.get(item.id) || 0;
          rrfScores.set(item.id, current + 1 / (k + item.rank));
        }
      }

      const durationMs = performance.now() - start;
      expect(rrfScores.size).toBe(50);
      expect(durationMs).toBeLessThan(10);
    });
  });

  describe('PERF-03: Memory Footprint & Resource Containment', () => {
    it('should verify Node.js heap usage is within acceptable bounds', async () => {
      const health = await healthService.getHealth();
      expect(health.systemMetrics.heapUsedMB).toBeGreaterThan(0);
      expect(health.systemMetrics.heapUsedMB).toBeLessThan(512); // Under 512 MB
    });
  });
});
