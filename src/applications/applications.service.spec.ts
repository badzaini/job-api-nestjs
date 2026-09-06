import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { ApplicationsService } from './applications.service';
import { Application } from './entities/application.entity';
import { JobsService } from '../jobs/jobs.service';
import { JobStatus } from '../jobs/enums/jobs_status.enum';
import { BadRequestException, NotFoundException } from '@nestjs/common';

describe('ApplicationsService', () => {
  let service: ApplicationsService;

  const mockQueryBuilder = {
    where: jest.fn().mockReturnThis(),
    andWhere: jest.fn().mockReturnThis(),
    getOne: jest.fn(),
  };

  const mockApplicationRepository = {
    save: jest.fn(),
    find: jest.fn(),
    createQueryBuilder: jest.fn(() => mockQueryBuilder),
  };

  const mockJobsService = {
    findOne: jest.fn(),
  };

  // beforeEach(async () => {
  //   const module: TestingModule = await Test.createTestingModule({
  //     providers: [ApplicationsService],
  //   }).compile();

  //   service = module.get<ApplicationsService>(ApplicationsService);
  // });

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ApplicationsService,
        {
          provide: getRepositoryToken(Application),
          useValue: mockApplicationRepository,
        },
        {
          provide: JobsService,
          useValue: mockJobsService,
        },
      ],
    }).compile();

    service = module.get<ApplicationsService>(ApplicationsService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should create an application for an open job', async () => {
    const job = {
      id: 'job-1',
      title: 'Software Engineer',
      description: 'Backend developer',
      location: 'Kuala Lumpur',
      createdAt: new Date(),
      status: JobStatus.OPEN,
    };

    const dto = {
      candidateName: 'John Doe',
      candidateEmail: 'john@example.com',
      coverLetter: 'This is testing cover letter',
    };

    mockJobsService.findOne.mockResolvedValue(job);

    mockApplicationRepository.save.mockResolvedValue({
      id: 'application-1',
      jobId: 'job-1',
      candidateName: 'John Doe',
      candidateEmail: 'john@example.com',
      coverLetter: 'This is testing cover letter',
      submittedAt: new Date(),
    });

    const result = await service.create('job-1', dto);

    expect(mockJobsService.findOne).toHaveBeenCalledWith('job-1');

    expect(mockApplicationRepository.save).toHaveBeenCalled();

    expect(result).toBeDefined();
  });

  it('should reject application if job is closed', async () => {
    mockJobsService.findOne.mockResolvedValue({
      id: 'job-1',
      status: JobStatus.CLOSED,
    });

    await expect(
      service.create('job-1', {
        candidateName: 'John Doe',
        candidateEmail: 'john@example.com',
        coverLetter: 'This is testing cover letter',
      }),
    ).rejects.toThrow(BadRequestException);

    expect(mockApplicationRepository.save).not.toHaveBeenCalled();
  });

  it('should reject application if job does not exist', async () => {
    mockJobsService.findOne.mockResolvedValue(null);

    await expect(
      service.create('job-1', {
        candidateName: 'John Doe',
        candidateEmail: 'john@example.com',
        coverLetter: 'This is testing cover letter',
      }),
    ).rejects.toThrow(NotFoundException);

    expect(mockApplicationRepository.save).not.toHaveBeenCalled();
  });

  it('should return applications for a job', async () => {
    const applications = [
      {
        id: 'application-1',
        jobId: 'job-1',
        candidateName: 'John Doe',
        candidateEmail: 'john@example.com',
        coverLetter: 'This is testing cover letter',
        submittedAt: new Date(),
      },
    ];

    mockApplicationRepository.find.mockResolvedValue(applications);

    const result = await service.findAllApplicationsByJobId('job-1');

    expect(mockApplicationRepository.find).toHaveBeenCalledWith({
      where: {
        jobId: 'job-1',
      },
    });

    expect(result).toEqual(applications);
  });

  it('should reject duplicate applications with the same email', async () => {
    mockJobsService.findOne.mockResolvedValue({
      id: 'job-1',
      status: JobStatus.OPEN,
    });

    mockQueryBuilder.getOne.mockResolvedValue({
      id: 'application-1',
      jobId: 'job-1',
      candidateName: 'John Doe',
      candidateEmail: 'john@example.com',
      coverLetter: 'This is testing cover letter',
    });

    await expect(
      service.create('job-1', {
        candidateName: 'Another Person',
        candidateEmail: 'JOHN@EXAMPLE.COM',
        coverLetter: 'This is testing cover letter',
      }),
    ).rejects.toThrow(BadRequestException);

    expect(mockApplicationRepository.save).not.toHaveBeenCalled();
  });
});
