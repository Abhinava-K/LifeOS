import { Test, TestingModule } from '@nestjs/testing';
import { NotesService } from './notes.service';

describe('NotesService', () => {
  let service: NotesService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [NotesService],
    }).compile();

    service = module.get<NotesService>(NotesService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should return initial seeded notes', async () => {
    const result = await service.findAll('usr_demo_123', {});
    expect(result.items.length).toBeGreaterThanOrEqual(2);
    expect(result.total).toBeGreaterThanOrEqual(2);
  });

  it('should create a new note with extracted wikilinks and tags (REQ-NOTE-1)', async () => {
    const note = await service.createNote('usr_test_123', {
      title: 'Neural Networks & Deep Learning',
      content: '# Deep Learning\nMulti-layer perceptron architecture. References [[Backpropagation]] and [[SGD]]. #ai #deeplearning',
      tags: ['customtag'],
    });

    expect(note).toBeDefined();
    expect(note.title).toBe('Neural Networks & Deep Learning');
    expect(note.wikilinks).toContain('Backpropagation');
    expect(note.wikilinks).toContain('SGD');
    expect(note.tags).toContain('ai');
    expect(note.tags).toContain('deeplearning');
    expect(note.tags).toContain('customtag');
    expect(note.hasEmbedding).toBe(true);
  });

  it('should generate a 3-bullet summary for long notes (REQ-NOTE-2)', async () => {
    const note = await service.createNote('usr_test_123', {
      title: 'Distributed Systems Principles',
      content: 'Line 1: Distributed consensus algorithms like Raft and Paxos ensure consistency across cluster nodes.\nLine 2: Partition tolerance requires choosing between availability and consistency under CAP theorem.\nLine 3: Vector clocks provide causal ordering for distributed event streams.',
    });

    expect(note.summary).toBeDefined();
    expect(note.summary).toContain('•');
  });

  it('should filter notes by search query', async () => {
    const searchResult = await service.findAll('usr_demo_123', { search: 'Operating Systems' });
    expect(searchResult.items.length).toBeGreaterThanOrEqual(1);
    expect(searchResult.items[0].title).toContain('Operating Systems');
  });

  it('should update an existing note', async () => {
    const updated = await service.updateNote('usr_demo_123', 'note-001', {
      title: 'Updated Operating Systems Note',
      isPinned: false,
    });

    expect(updated.title).toBe('Updated Operating Systems Note');
    expect(updated.isPinned).toBe(false);
  });

  it('should throw NotFoundException for non-existent note', async () => {
    await expect(service.findOne('usr_demo_123', 'non-existent-id')).rejects.toThrow();
  });
});
