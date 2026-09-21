import { Test, TestingModule } from '@nestjs/testing';
import { RedisService } from '../../database/redis.service';
import { SessionManagerService } from './session-manager.service';

describe('SessionManagerService', () => {
  let service: SessionManagerService;
  let redisService: jest.Mocked<RedisService>;

  beforeEach(async () => {
    const redisMock = {
      get: jest.fn(),
      set: jest.fn(),
      del: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SessionManagerService,
        { provide: RedisService, useValue: redisMock },
      ],
    }).compile();

    service = module.get<SessionManagerService>(SessionManagerService);
    redisService = module.get(RedisService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should append message and maintain sliding context window', async () => {
    redisService.get.mockResolvedValue(null);
    redisService.set.mockResolvedValue('OK');

    await service.appendMessage('usr_1', 'sess_1', {
      role: 'user',
      content: 'Hello AI',
    });

    expect(redisService.set).toHaveBeenCalledTimes(1);
    const history = await service.getSessionHistory('usr_1', 'sess_1');
    expect(history).toBeDefined();
  });

  it('should retrieve session history from Redis when available', async () => {
    const mockHistory = [
      { role: 'user', content: 'What is my plan?' },
      { role: 'assistant', content: 'You have 3 tasks today.' },
    ];
    redisService.get.mockResolvedValue(JSON.stringify(mockHistory));

    const history = await service.getSessionHistory('usr_1', 'sess_1');
    expect(history).toHaveLength(2);
    expect(history[0].content).toBe('What is my plan?');
  });

  it('should clear session history', async () => {
    redisService.del.mockResolvedValue(1);
    const result = await service.clearSession('usr_1', 'sess_1');
    expect(result).toBe(true);
    expect(redisService.del).toHaveBeenCalledWith('chat_session:usr_1:sess_1');
  });
});
