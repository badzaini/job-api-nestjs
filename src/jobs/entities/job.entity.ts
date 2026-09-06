import { JobStatus } from '../enums/jobs_status.enum';
import { Entity, Column, PrimaryColumn, OneToMany } from 'typeorm';
import { Application } from '../../applications/entities/application.entity';

@Entity()
export class Job {
  @PrimaryColumn()
  id: string;
  @Column()
  title: string;
  @Column()
  description: string;
  @Column()
  company: string;
  @Column()
  location: string;
  @Column()
  createdAt: Date;
  @Column()
  updatedAt: Date;
  @Column({ type: 'simple-enum', enum: JobStatus })
  status: JobStatus;
  @OneToMany(() => Application, (application) => application.job)
  applications?: Application[];
}
