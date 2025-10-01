import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/mongoose';
import { ServanteesService } from './servantees.service';
import { Servantee } from './schemas/servantee.schema';
import { Model } from 'mongoose';

// Create a mock model with Jest
const mockServantee = {
  _id: 'mockId123',
  phone: '0100000000',
  name: 'John Doe',
  birthDate: new Date('2000-01-01'),
  education: 'University',
  work: 'Engineer',
  church: 'St. Mary',
  retreatDates: [new Date('2023-05-01')],
  notes: ['Note 1'],
  isActive: true,
};

const mockServanteeModel = () => ({
  new: jest.fn().mockResolvedValue(mockServantee),
  constructor: jest.fn().mockResolvedValue(mockServantee),
  find: jest.fn().mockReturnThis(),
  exec: jest.fn(),
  findById: jest.fn().mockReturnThis(),
  findByIdAndUpdate: jest.fn().mockReturnThis(),
  findByIdAndDelete: jest.fn().mockReturnThis(),
  save: jest.fn(),
  create: jest.fn(),
});

describe('ServanteesService', () => {
  let service: ServanteesService;
  let model: Model<Servantee>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ServanteesService,
        {
          provide: getModelToken(Servantee.name),
          useFactory: mockServanteeModel,
        },
      ],
    }).compile();

    service = module.get<ServanteesService>(ServanteesService);
    model = module.get<Model<Servantee>>(getModelToken(Servantee.name));
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create a servantee', async () => {
      jest.spyOn(model, 'create').mockResolvedValueOnce(mockServantee as any);
      const result = await service.create({
        phone: '0100000000',
        name: 'John Doe',
      });
      expect(result).toEqual(mockServantee);
      expect(model.create).toHaveBeenCalledWith({
        phone: '0100000000',
        name: 'John Doe',
      });
    });
  });

  describe('findAll', () => {
    it('should return an array of servantees', async () => {
      jest.spyOn(model, 'find').mockReturnValueOnce({
        exec: jest.fn().mockResolvedValueOnce([mockServantee]),
      } as any);

      const result = await service.findAll();
      expect(result).toEqual([mockServantee]);
    });
  });

  describe('findOne', () => {
    it('should return a servantee by id', async () => {
      jest.spyOn(model, 'findById').mockReturnValueOnce({
        exec: jest.fn().mockResolvedValueOnce(mockServantee),
      } as any);

      const result = await service.findOne('mockId123');
      expect(result).toEqual(mockServantee);
    });
  });

  describe('update', () => {
    it('should update and return a servantee', async () => {
      const updatedServantee = { ...mockServantee, name: 'Jane Doe' };

      jest.spyOn(model, 'findByIdAndUpdate').mockReturnValueOnce({
        exec: jest.fn().mockResolvedValueOnce(updatedServantee),
      } as any);

      const result = await service.update('mockId123', { name: 'Jane Doe' });
      expect(result).toEqual(updatedServantee);
    });
  });

  describe('remove', () => {
    it('should delete a servantee and return it', async () => {
      jest.spyOn(model, 'findByIdAndDelete').mockReturnValueOnce({
        exec: jest.fn().mockResolvedValueOnce(mockServantee),
      } as any);

      const result = await service.remove('mockId123');
      expect(result).toEqual(mockServantee);
    });
  });
});
