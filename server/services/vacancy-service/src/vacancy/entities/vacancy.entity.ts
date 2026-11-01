import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  PrimaryGeneratedColumn,
  UpdateDateColumn
} from 'typeorm';
import { VacancyLifecycle } from '../enums/vacancy-lifecycle.enum';
import {
  RECRUITER_EMAIL_MAX_LENGTH,
  RECRUITER_NAME_MAX_LENGTH,
  RECRUITER_PHONE_MAX_LENGTH,
  URL_MAX_LENGTH,
  VACANCY_COMPANY_MAX_LENGTH,
  VACANCY_TITLE_MAX_LENGTH
} from '../vacancy.constants';
@Entity({ schema: 'vacancy', name: 'vacancies' })
@Index('IDX_vacancies_user_updated', ['userId', 'updatedAt'])
export class Vacancy {
  @PrimaryGeneratedColumn('uuid') id!: string;
  @Column({ name: 'user_id', type: 'uuid' }) userId!: string;
  @Column({ type: 'varchar', length: VACANCY_TITLE_MAX_LENGTH })
  title!: string;
  @Column({ type: 'varchar', length: VACANCY_COMPANY_MAX_LENGTH })
  company!: string;
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
  @Column({
    name: 'source_url',
    type: 'varchar',
    length: URL_MAX_LENGTH,
    nullable: true
  })
  sourceUrl!: string | null;
  @Column({
    name: 'recruiter_name',
    type: 'varchar',
    length: RECRUITER_NAME_MAX_LENGTH,
    nullable: true
  })
  recruiterName!: string | null;
  @Column({
    name: 'recruiter_email',
    type: 'varchar',
    length: RECRUITER_EMAIL_MAX_LENGTH,
    nullable: true
  })
  recruiterEmail!: string | null;
  @Column({
    name: 'recruiter_phone',
    type: 'varchar',
    length: RECRUITER_PHONE_MAX_LENGTH,
    nullable: true
  })
  recruiterPhone!: string | null;
  @Column({
    name: 'recruiter_url',
    type: 'varchar',
    length: URL_MAX_LENGTH,
    nullable: true
  })
  recruiterUrl!: string | null;
  @Column({ name: 'offer_salary', type: 'integer', nullable: true })
  offerSalary!: number | null;
  @Column({ name: 'offer_growth', type: 'smallint', nullable: true })
  offerGrowth!: number | null;
  @Column({ name: 'offer_conditions', type: 'smallint', nullable: true })
  offerConditions!: number | null;
  @Column({
    type: 'enum',
    enum: VacancyLifecycle,
    default: VacancyLifecycle.ACTIVE
  })
  lifecycle!: VacancyLifecycle;
  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt!: Date;
  @UpdateDateColumn({ name: 'updated_at', type: 'timestamptz' })
  updatedAt!: Date;
}
