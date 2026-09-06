import { Job } from '../../jobs/entities/job.entity';
import {
  Entity,
  Column,
  PrimaryColumn,
  ManyToOne,
  JoinColumn,
  //ForeignKey
} from 'typeorm';

@Entity()
export class Application {
  @PrimaryColumn()
  id: string;
  @Column()
  jobId: string;
  @ManyToOne(() => Job, (job) => job.applications)
  @JoinColumn({ name: 'jobId' })
  job?: Job;
  @Column()
  candidateName: string;
  @Column()
  candidateEmail: string;
  @Column()
  coverLetter: string;
  @Column()
  submittedAt: Date;
}
