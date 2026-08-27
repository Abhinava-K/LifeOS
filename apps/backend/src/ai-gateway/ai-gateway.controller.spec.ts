import { Test, TestingModule } from '@nestjs/testing';
import { JwtService } from '@nestjs/jwt';
import { AiGatewayController } from './ai-gateway.controller';
import { AiRouterService } from './services/ai-router.service';
import { SessionManagerService } from './services/session-manager.service';
import { LlmProvider } from './dto/chat-prompt.dto';

describe('AiGatewayController', () => {
  let controller: AiGatewayController;
  let aiRouterService: jest.Mocked<AiRouterService>;
  let sessionManager: jest.Mocked<SessionManagerService>;

  beforeEach(async () => {
    const aiRouterMock = {
      executeCompletion: jest.fn(),
      streamCompletion: jest.fn(),
      dispatchAgentTask: jest.fn(),
      getAvailableProviders: jest.fn(),
    };

    const sessionManagerMock = {
      getSessionHistory: jest.fn(),
      clearSession: jest.fn(),
    };

    const jwtServiceMock = {
      verifyAsync: jest.fn().mockResolvedValue({ sub: 'usr_test_123' }),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [AiGatewayController],
      providers: [
        { provide: AiRouterService, useValue: aiRouterMock },
        { provide: SessionManagerService, useValue: sessionManagerMock },
        { provide: JwtService, useValue: jwtServiceMock },
      ],
    }).compile();

    controller = module.get<AiGatewayController>(AiGatewayController);
    aiRouterService = module.get(AiRouterService);
    sessionManager = module.get(SessionManagerService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('should return chat completion', async () => {
    const mockResult = {
      sessionId: 'sess_123',
      provider: 'gemini',
      model: 'gemini-1.5-pro',
      content: 'Here is your completed summary.',
      promptTokens: 10,
      completionTokens: 20,
      totalTokens: 30,
    };
    aiRouterService.executeCompletion.mockResolvedValue(mockResult);

    const req = { user: { sub: 'usr_test_123' } };
    const res = await controller.chatCompletion(req, {
      message: 'Hello AI',
      provider: LlmProvider.GEMINI,
    });

    expect(res).toEqual(mockResult);
    expect(aiRouterService.executeCompletion).toHaveBeenCalledWith('usr_test_123', {
      message: 'Hello AI',
      provider: LlmProvider.GEMINI,
    });
  });

  it('should dispatch agent task', async () => {
    const mockDispatch = {
      dispatchId: 'dispatch_999',
      status: 'QUEUED',
      agentRole: 'planner',
      task: 'Create study plan',
      parameters: {},
      estimatedCompletionSec: 5,
      timestamp: new Date().toISOString(),
    };
    aiRouterService.dispatchAgentTask.mockResolvedValue(mockDispatch);

    const req = { user: { sub: 'usr_test_123' } };
    const res = await controller.dispatchAgent(req, { task: 'Create study plan' });
    expect(res).toEqual(mockDispatch);
  });

  it('should return providers list', () => {
    const mockProviders = [
      { name: 'gemini', available: true, defaultModel: 'gemini-1.5-pro' },
    ];
    aiRouterService.getAvailableProviders.mockReturnValue(mockProviders);

    const res = controller.getProviders();
    expect(res.providers).toEqual(mockProviders);
  });

  it('should return session history', async () => {
    const mockHistory = [{ role: 'user' as const, content: 'Hi' }];
    sessionManager.getSessionHistory.mockResolvedValue(mockHistory);

    const req = { user: { sub: 'usr_test_123' } };
    const res = await controller.getSessionHistory(req, 'sess_123', 10);
    expect(res.count).toBe(1);
    expect(res.history).toEqual(mockHistory);
  });
});
