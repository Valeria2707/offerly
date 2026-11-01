import {
  ConflictException,
  Injectable,
  Logger,
  OnApplicationBootstrap
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { hash } from 'bcryptjs';
import { isUniqueViolation } from '@offerly/helpers';
import { Repository } from 'typeorm';
import { PASSWORD_HASH_ROUNDS } from './auth.constants';
import { RegisterDto } from './dto/register.dto';
import { User } from './entities/user.entity';

export const hashPassword = (password: string): Promise<string> =>
  hash(password, PASSWORD_HASH_ROUNDS);

@Injectable()
export class UsersService implements OnApplicationBootstrap {
  private readonly logger = new Logger(UsersService.name);

  constructor(
    @InjectRepository(User) private readonly users: Repository<User>,
    private readonly config: ConfigService
  ) {}

  async onApplicationBootstrap(): Promise<void> {
    const email = this.normalizeEmail(
      this.config.getOrThrow<string>('AUTH_EMAIL')
    );
    if (await this.findByEmail(email)) return;
    await this.create({
      name: this.config.getOrThrow<string>('AUTH_NAME'),
      email,
      password: this.config.getOrThrow<string>('AUTH_PASSWORD')
    });
    this.logger.log(`Created initial user ${email}`);
  }

  async create(input: RegisterDto): Promise<User> {
    const user = this.users.create({
      name: input.name.trim(),
      email: this.normalizeEmail(input.email),
      passwordHash: await hashPassword(input.password),
      googleId: null,
      isActive: true
    });
    try {
      return await this.users.save(user);
    } catch (error: unknown) {
      if (isUniqueViolation(error))
        throw new ConflictException('A user with this email already exists');
      throw error;
    }
  }

  findByEmail(email: string): Promise<User | null> {
    return this.users.findOneBy({ email: this.normalizeEmail(email) });
  }

  findById(id: string): Promise<User | null> {
    return this.users.findOneBy({ id });
  }

  async findOrCreateGoogleUser(input: {
    googleId: string;
    email: string;
    name: string;
  }): Promise<User> {
    const email = this.normalizeEmail(input.email);
    const byGoogleId = await this.users.findOneBy({ googleId: input.googleId });
    if (byGoogleId) return byGoogleId;

    const byEmail = await this.findByEmail(email);
    if (byEmail) {
      byEmail.googleId = input.googleId;
      return this.users.save(byEmail);
    }

    return this.users.save(
      this.users.create({
        name: input.name.trim(),
        email,
        passwordHash: null,
        googleId: input.googleId,
        isActive: true
      })
    );
  }

  private normalizeEmail(email: string): string {
    return email.trim().toLowerCase();
  }
}
