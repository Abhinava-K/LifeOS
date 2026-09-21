import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { AiRouterService } from './ai-router.service';
import { SessionManagerService } from './session-manager.service';
import { LlmProvider } from '../dto/chat-prompt.dto';

describe('AiRouterService', () => {
  let service: AiRouterService;
  let sessionManager: jest.Mocked<SessionManagerService>;

  beforeEach(async () => {
    const sessionManagerMock = {
      appendMessage: jest.fn().mockResolvedValue(undefined),
      getSessionHistory: jest.fn().mockResolvedValue([]),
      clearSession: jest.fn().mockResolvedValue(true),
    };

    const configServiceMock = {
      get: jest.fn((key: string) => {
        if (key === 'GEMINI_API_KEY') return 'mock_gemini_key';
        if (key === 'GROQ_API_KEY') return 'mock_groq_key';
        return null;
      }),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AiRouterService,
        { provide: SessionManagerService, useValue: sessionManagerMock },
        { provide: ConfigService, useValue: configServiceMock },
      ],
    }).compile();

    service = module.get<AiRouterService>(AiRouterService);
    sessionManager = module.get(SessionManagerService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should return available AI providers', () => {
    const providers = service.getAvailableProviders();
    expect(providers).toHaveLength(3);
    expect(providers[0].name).toBe(LlmProvider.GEMINI);
  });

  it('should execute completion successfully', async () => {
    const result = await service.executeCompletion('usr_test', {
      message: 'Hello, organize my tasks',
      provider: LlmProvider.GEMINI,
    });

    expect(result).toBeDefined();
    expect(result.sessionId).toBeDefined();
    expect(result.content).toContain('LifeOS AI Engine');
    expect(sessionManager.appendMessage).toHaveBeenCalledTimes(2);
  });

  it('should trigger provider fallback when primary provider errors out', async () => {
    const result = await service.executeCompletion('usr_test', {
      message: 'simulate error for gemini',
      provider: LlmProvider.GEMINI,
    });

    expect(result).toBeDefined();
    expect(result.provider).toBe(LlmProvider.GROQ);
  });

  it('should dispatch agent task to multi-agent microservice', async () => {
    const result = await service.dispatchAgentTask('usr_test', {
      task: 'Analyze monthly budget',
      agentRole: 'financial_analyst',
    });

    expect(result.status).toBe('QUEUED');
    expect(result.agentRole).toBe('financial_analyst');
  });

  it('should stream completion tokens as Observable', (done) => {
    const stream$ = service.streamCompletion('usr_test', {
      message: 'Stream this short test string',
    });

    let receivedTokens = 0;
    stream$.subscribe({
      next: (event) => {
        const payload = JSON.parse(event.data);
        if (payload.token) {
          receivedTokens++;
        }
      },
      complete: () => {
        expect(receivedTokens).toBeGreaterThan(0);
        done();
      },
    });
  });
});
