import { Test, TestingModule } from '@nestjs/testing';
import { JobsService } from './jobs.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Job } from './entities/job.entity';
import { JobStatus } from './enums/jobs_status.enum';
import { BadRequestException, NotFoundException } from '@nestjs/common';

describe('JobsService', () => {
  let service: JobsService;

  const mockJobRepository = {
    save: jest.fn(),
    find: jest.fn(),
    findOneBy: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        JobsService,
        {
          provide: getRepositoryToken(Job),
          useValue: mockJobRepository,
        },
      ],
    }).compile();

    service = module.get<JobsService>(JobsService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should create a job', async () => {
    const dto = {
      title: 'Software Engineer',
      description: 'Backend developer',
      company: 'ABC Company',
      location: 'Kuala Lumpur',
      status: JobStatus.OPEN,
    };

    mockJobRepository.save.mockResolvedValue({
      id: 'job-1',
      ...dto,
      createdAt: new Date(),
    });

    const result = await service.create(dto);

    expect(mockJobRepository.save).toHaveBeenCalledWith(
      expect.objectContaining({
        title: 'Software Engineer',
        description: 'Backend developer',
        company: 'ABC Company',
        location: 'Kuala Lumpur',
        status: JobStatus.OPEN,
        createdAt: expect.any(Date),
        updatedAt: expect.any(Date),
      }),
    );

    expect(result).toBeDefined();
  });

  it('should return jobs filtered by status', async () => {
    const jobs = [
      {
        id: 'job-1',
        title: 'Software Engineer',
        description: 'Backend developer',
        location: 'Kuala Lumpur',
        createdAt: new Date(),
        status: JobStatus.OPEN,
      },
    ];

    mockJobRepository.find.mockResolvedValue(jobs);

    const result = await service.findAll(JobStatus.OPEN);

    expect(mockJobRepository.find).toHaveBeenCalledWith({
      where: {
        status: JobStatus.OPEN,
      },
    });

    expect(result).toEqual(jobs);
  });

  it('should return all jobs when no status is provided', async () => {
    const jobs = [
      {
        id: 'job-1',
        title: 'Software Engineer',
        description: 'Backend developer',
        location: 'Kuala Lumpur',
        createdAt: new Date(),
        status: JobStatus.OPEN,
      },
      {
        id: 'job-2',
        title: 'Frontend Developer',
        description: 'Frontend developer',
        location: 'Selangor',
        createdAt: new Date(),
        status: JobStatus.CLOSED,
      },
    ];

    mockJobRepository.find.mockResolvedValue(jobs);

    const result = await service.findAll();

    expect(mockJobRepository.find).toHaveBeenCalledWith();
    expect(result).toEqual(jobs);
  });

  it('should return a job by id', async () => {
    const job = {
      id: 'job-1',
      title: 'Software Engineer',
      description: 'Backend developer',
      location: 'Kuala Lumpur',
      createdAt: new Date(),
      status: JobStatus.OPEN,
    };

    mockJobRepository.findOneBy.mockResolvedValue(job);

    const result = await service.findOne('job-1');

    expect(mockJobRepository.findOneBy).toHaveBeenCalledWith({
      id: 'job-1',
    });

    expect(result).toEqual(job);
  });

  it('should update a job status', async () => {
    const oldUpdatedAt = new Date();

    const job = {
      id: 'job-1',
      title: 'Software Engineer',
      description: 'Backend developer',
      company: 'ABC Company',
      location: 'Kuala Lumpur',
      createdAt: new Date(),
      updatedAt: oldUpdatedAt,
      status: JobStatus.OPEN,
    };

    mockJobRepository.findOneBy.mockResolvedValue(job);

    mockJobRepository.save.mockResolvedValue({
      ...job,
      status: JobStatus.CLOSED,
      updatedAt: new Date(),
    });

    const result = await service.update('job-1', {
      status: JobStatus.CLOSED,
    });

    expect(mockJobRepository.findOneBy).toHaveBeenCalledWith({
      id: 'job-1',
    });

    expect(mockJobRepository.save).toHaveBeenCalled();

    const savedJob = mockJobRepository.save.mock.calls[0][0];

    expect(savedJob.id).toBe('job-1');
    expect(savedJob.status).toBe(JobStatus.CLOSED);
    expect(savedJob.updatedAt).toBeInstanceOf(Date);
    expect(savedJob.updatedAt).not.toBe(oldUpdatedAt);

    expect(result.status).toBe(JobStatus.CLOSED);
  });

  it('should reject updating a job that does not exist', async () => {
    mockJobRepository.findOneBy.mockResolvedValue(null);

    await expect(
      service.update('job-1', {
        status: JobStatus.CLOSED,
      }),
    ).rejects.toThrow(NotFoundException);

    expect(mockJobRepository.save).not.toHaveBeenCalled();
  });

  it('should reject updating fields other than status', async () => {
    mockJobRepository.findOneBy.mockResolvedValue({
      id: 'job-1',
      title: 'Software Engineer',
      description: 'Backend developer',
      location: 'Kuala Lumpur',
      createdAt: new Date(),
      status: JobStatus.OPEN,
    });

    await expect(
      service.update('job-1', {
        status: JobStatus.CLOSED,
        title: 'Senior Software Engineer',
      }),
    ).rejects.toThrow(BadRequestException);

    expect(mockJobRepository.save).not.toHaveBeenCalled();
  });
});
