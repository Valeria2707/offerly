import { Body, Controller, Get, HttpCode, HttpStatus, Post, Req, UseGuards } from '@nestjs/common';
import { ApiAcceptedResponse, ApiBearerAuth, ApiBody, ApiConflictResponse, ApiCreatedResponse, ApiNoContentResponse, ApiOkResponse, ApiOperation, ApiUnauthorizedResponse, ApiTags } from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { AuthenticatedRequest } from './auth.types';
import { AuthResponseDto, ProfileResponseDto } from './dto/auth-response.dto';
import { LoginDto } from './dto/login.dto';
import { JwtAuthGuard } from './jwt-auth.guard';
import { RegisterDto } from './dto/register.dto';
import { ForgotPasswordDto, ResetPasswordDto } from './dto/password-reset.dto';
import { PasswordResetService } from './password-reset.service';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly auth: AuthService, private readonly passwordReset: PasswordResetService) {}

  @Post('register')
  @ApiOperation({ summary: 'Create a user account' })
  @ApiCreatedResponse({ type: ProfileResponseDto })
  @ApiConflictResponse({ description: 'A user with this email already exists' })
  register(@Body() input: RegisterDto): Promise<ProfileResponseDto> {
    return this.auth.register(input);
  }

  @Post('login')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Log in and receive a JWT access token' })
  @ApiBody({ type: LoginDto })
  @ApiOkResponse({ type: AuthResponseDto })
  @ApiUnauthorizedResponse({ description: 'Invalid username or password' })
  login(@Body() credentials: LoginDto): Promise<AuthResponseDto> {
    return this.auth.login(credentials);
  }

  @Post('forgot-password')
  @HttpCode(HttpStatus.ACCEPTED)
  @ApiOperation({ summary: 'Send a password-reset email if the account exists' })
  @ApiAcceptedResponse({ description: 'Request accepted' })
  async forgotPassword(@Body() input: ForgotPasswordDto): Promise<void> {
    await this.passwordReset.request(input.email);
  }

  @Post('reset-password')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Set a new password using a one-time email token' })
  @ApiNoContentResponse({ description: 'Password changed' })
  async resetPassword(@Body() input: ResetPasswordDto): Promise<void> {
    await this.passwordReset.reset(input.token, input.password);
  }

  @Post('logout')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Revoke the current JWT access token' })
  @ApiNoContentResponse({ description: 'The current token was revoked' })
  @ApiUnauthorizedResponse({ description: 'Token is missing, invalid, expired, or revoked' })
  async logout(@Req() request: AuthenticatedRequest): Promise<void> {
    await this.auth.logout(request.user);
  }

  @Get('me')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Return the authenticated user profile' })
  @ApiOkResponse({ type: ProfileResponseDto })
  @ApiUnauthorizedResponse({ description: 'Token is missing, invalid, expired, or revoked' })
  me(@Req() request: AuthenticatedRequest): ProfileResponseDto {
    return { id: request.user.sub, name: request.user.name, email: request.user.email };
  }
}
