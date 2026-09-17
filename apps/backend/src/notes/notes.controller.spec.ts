import { Test, TestingModule } from '@nestjs/testing';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { NotesController } from './notes.controller';
import { NotesService } from './notes.service';

describe('NotesController', () => {
  let controller: NotesController;
  let service: NotesService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [NotesController],
      providers: [NotesService],
    })
      .overrideGuard(JwtAuthGuard)
      .useValue({ canActivate: () => true })
      .compile();


    controller = module.get<NotesController>(NotesController);
    service = module.get<NotesService>(NotesService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('should create a note', async () => {
    const req = { user: { userId: 'usr_test_ctrl' } } as any;
    const res = await controller.createNote(req, {
      title: 'Controller Test Note',
      content: 'Content for controller spec test [[Target]]. #test',
    });

    expect(res.success).toBe(true);
    expect(res.data.title).toBe('Controller Test Note');
  });

  it('should list notes with pagination meta', async () => {
    const req = { user: { userId: 'usr_demo_123' } } as any;
    const res = await controller.findAll(req, { limit: 10, offset: 0 });

    expect(res.success).toBe(true);
    expect(Array.isArray(res.data)).toBe(true);
    expect(res.meta.limit).toBe(10);
  });

  it('should retrieve wikilink graph', async () => {
    const req = { user: { userId: 'usr_demo_123' } } as any;
    const res = await controller.getWikiGraph(req);

    expect(res.success).toBe(true);
    expect(res.data.nodes).toBeDefined();
    expect(res.data.links).toBeDefined();
  });
});
