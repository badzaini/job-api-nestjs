import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateJobDto } from './dto/create-job.dto';
import { UpdateJobDto } from './dto/update-job.dto';
import { Job } from './entities/job.entity';
import { randomUUID } from 'crypto';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { JobStatus } from './enums/jobs_status.enum';

@Injectable()
export class JobsService {
  // private readonly jobs: Job[] = [];
  constructor(
    @InjectRepository(Job)
    private readonly jobRepository: Repository<Job>,
  ) {}

  create(createJobDto: CreateJobDto) {
    const now = new Date();
    const job: Job = {
      id: randomUUID(),
      title: createJobDto.title,
      description: createJobDto.description,
      company: createJobDto.company,
      location: createJobDto.location,
      createdAt: now,
      updatedAt: now,
      status: createJobDto.status,
    };

    return this.jobRepository.save(job);
  }

  findAll(status?: JobStatus) {
    if (status) {
      return this.jobRepository.find({
        where: {
          status: status,
        },
      });
    }

    return this.jobRepository.find();
  }

  async findOne(id: string) {
    const job = await this.jobRepository.findOneBy({ id });

    if (!job) {
      throw new NotFoundException('Job not found');
    }

    return job;
  }

  async update(id: string, updateJobDto: UpdateJobDto) {
    const job = await this.jobRepository.findOneBy({ id });

    if (!job) {
      throw new NotFoundException('Job not found');
    }

    const keys = Object.keys(updateJobDto);

    if (keys.some((key) => key !== 'status')) {
      throw new BadRequestException('You can only update the job status');
    }

    job.status = updateJobDto.status;
    job.updatedAt = new Date();

    return this.jobRepository.save(job);
  }

  remove(id: number) {
    return `This action removes a #${id} job`;
  }
}
