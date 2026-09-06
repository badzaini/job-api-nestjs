import { JobStatus } from '../enums/jobs_status.enum';
import { IsString, IsEnum, IsNotEmpty } from 'class-validator';

export class CreateJobDto {
  @IsString()
  @IsNotEmpty()
  title: string;
  @IsString()
  @IsNotEmpty()
  description: string;
  @IsString()
  @IsNotEmpty()
  company: string;
  @IsString()
  @IsNotEmpty()
  location: string;
  @IsEnum(JobStatus)
  @IsNotEmpty()
  status: JobStatus;
}
