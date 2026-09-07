import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn
} from 'typeorm';
import { VacancyStatus } from '../enums/vacancy-status.enum';
@Entity({ schema: 'vacancy', name: 'vacancies' })
export class Vacancy {
  @PrimaryGeneratedColumn('uuid') id!: string;
  @Column({ name: 'user_id', type: 'uuid' }) userId!: string;
  @Column({ type: 'varchar', length: 300 }) title!: string;
  @Column({ type: 'varchar', length: 300 }) company!: string;
  @Column({ type: 'varchar', length: 500, nullable: true }) location!:
    string | null;
  @Column({ name: 'work_format', type: 'varchar', length: 100, nullable: true })
  workFormat!: string | null;
  @Column({
    name: 'employment_type',
    type: 'varchar',
    length: 100,
    nullable: true
  })
  employmentType!: string | null;
  @Column({ type: 'varchar', length: 100, nullable: true }) level!:
    string | null;
  @Column({
    name: 'salary_range',
    type: 'varchar',
    length: 200,
    nullable: true
  })
  salaryRange!: string | null;
  @Column({ name: 'posted_at', type: 'date', nullable: true }) postedAt!:
    string | null;
  @Column({ type: 'text', nullable: true }) description!: string | null;
  @Column({ name: 'required_skills', type: 'text', array: true, default: '{}' })
  requiredSkills!: string[];
  @Column({
    name: 'preferred_skills',
    type: 'text',
    array: true,
    default: '{}'
  })
  preferredSkills!: string[];
  @Column({ name: 'experience_requirement', type: 'text', nullable: true })
  experienceRequirement!: string | null;
  @Column({ name: 'education_requirement', type: 'text', nullable: true })
  educationRequirement!: string | null;
  @Column({
    name: 'language_requirements',
    type: 'text',
    array: true,
    default: '{}'
  })
  languageRequirements!: string[];
  @Column({ name: 'source_url', type: 'varchar', length: 2048, nullable: true })
  sourceUrl!: string | null;
  @Column({ type: 'enum', enum: VacancyStatus, default: VacancyStatus.SAVED })
  status!: VacancyStatus;
  @Column({ name: 'next_step', type: 'text', nullable: true }) nextStep!:
    string | null;
  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt!: Date;
  @UpdateDateColumn({ name: 'updated_at', type: 'timestamptz' })
  updatedAt!: Date;
}
