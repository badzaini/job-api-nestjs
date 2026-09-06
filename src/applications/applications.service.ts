import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateApplicationDto } from './dto/create-application.dto';
// import { UpdateApplicationDto } from './dto/update-application.dto';
import { Application } from './entities/application.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { randomUUID } from 'crypto';
import { JobsService } from '../jobs/jobs.service';
import { JobStatus } from '../jobs/enums/jobs_status.enum';

@Injectable()
export class ApplicationsService {
  constructor(
    @InjectRepository(Application)
    private readonly applicationRepository: Repository<Application>,
    private readonly jobsService: JobsService,
  ) {}
  async create(jobId: string, createApplicationDto: CreateApplicationDto) {
    const job = await this.jobsService.findOne(jobId);

    if (!job) {
      throw new NotFoundException('Job not found.');
    }

    if (job.status === JobStatus.CLOSED) {
      throw new BadRequestException('This job application has been closed.');
    }

    const existingApplication = await this.applicationRepository
      .createQueryBuilder('application')
      .where('application.jobId = :jobId', { jobId })
      .andWhere('LOWER(application.candidateEmail) = LOWER(:candidateEmail)', {
        candidateEmail: createApplicationDto.candidateEmail,
      })
      .getOne();

    if (existingApplication) {
      throw new BadRequestException(
        'This email has already applied to this job.',
      );
    }

    const application: Application = {
      id: randomUUID(),
      jobId,
      candidateName: createApplicationDto.candidateName,
      candidateEmail: createApplicationDto.candidateEmail,
      coverLetter: createApplicationDto.coverLetter,
      submittedAt: new Date(),
    };

    return this.applicationRepository.save(application);
  }

  findAll() {
    return this.applicationRepository.find();
  }

  findAllApplicationsByJobId(jobId: string) {
    return this.applicationRepository.find({
      where: {
        jobId: jobId,
      },
    });
  }

  findOne(id: string) {
    return this.applicationRepository.findOneBy({ id });
  }

  // update(id: number, updateApplicationDto: UpdateApplicationDto) {
  //   return `This action updates a #${id} application`;
  // }

  remove(id: number) {
    return `This action removes a #${id} application`;
  }
}
