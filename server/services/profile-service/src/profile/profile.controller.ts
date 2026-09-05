import { Body, Controller, Get, HttpCode, HttpStatus, Param, ParseUUIDPipe, Patch, Post, Req, UploadedFile, UseGuards, UseInterceptors } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiBadRequestResponse, ApiBearerAuth, ApiBody, ApiConsumes, ApiNotFoundResponse, ApiOkResponse, ApiOperation, ApiPayloadTooLargeResponse, ApiServiceUnavailableResponse, ApiTags, ApiUnauthorizedResponse, ApiUnprocessableEntityResponse } from '@nestjs/swagger';
import { AuthenticatedRequest } from '../auth/auth.types';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CV_MAX_UPLOAD_SIZE_BYTES } from '../cv/cv.constants';
import { ApplyCvImportDto, CvImportResponseDto, ProfileResponseDto, UpdateProfileDto } from './dto/profile.dto';
import { ProfileService } from './profile.service';

@ApiTags('profile')
@ApiBearerAuth()
@ApiUnauthorizedResponse({ description: 'Token is missing, invalid, or expired' })
@UseGuards(JwtAuthGuard)
@Controller('profile')
export class ProfileController {
  constructor(private readonly profiles: ProfileService) {}

  @Get()
  @ApiOperation({ summary: 'Get the authenticated user profile, creating an empty one when necessary' })
  @ApiOkResponse({ type: ProfileResponseDto })
  getProfile(@Req() request: AuthenticatedRequest): Promise<ProfileResponseDto> {
    return this.profiles.getProfile(request.user.sub);
  }

  @Patch()
  @ApiOperation({ summary: 'Update fields in the authenticated user profile' })
  @ApiOkResponse({ type: ProfileResponseDto })
  updateProfile(@Req() request: AuthenticatedRequest, @Body() input: UpdateProfileDto): Promise<ProfileResponseDto> {
    return this.profiles.updateProfile(request.user.sub, input);
  }

  @Post('cv-imports')
  @HttpCode(HttpStatus.OK)
  @UseInterceptors(FileInterceptor('file', { limits: { fileSize: CV_MAX_UPLOAD_SIZE_BYTES, files: 1 } }))
  @ApiConsumes('multipart/form-data')
  @ApiOperation({ summary: 'Temporarily process a PDF or DOCX CV and create a structured profile draft' })
  @ApiBody({
    schema: {
      type: 'object',
      required: ['file'],
      properties: { file: { type: 'string', format: 'binary' } }
    }
  })
  @ApiOkResponse({ type: CvImportResponseDto })
  @ApiBadRequestResponse({ description: 'File is missing or is not a valid PDF/DOCX' })
  @ApiPayloadTooLargeResponse({ description: 'File exceeds 10 MB' })
  @ApiUnprocessableEntityResponse({ description: 'Document text or structured data could not be extracted' })
  @ApiServiceUnavailableResponse({ description: 'AI parsing is not configured or the provider is unavailable' })
  importCv(
    @Req() request: AuthenticatedRequest,
    @UploadedFile() file: Express.Multer.File | undefined
  ): Promise<CvImportResponseDto> {
    return this.profiles.importCv(request.user.sub, file);
  }

  @Get('cv-imports/:id')
  @ApiOperation({ summary: 'Get a CV import draft owned by the authenticated user' })
  @ApiOkResponse({ type: CvImportResponseDto })
  @ApiNotFoundResponse({ description: 'CV import not found' })
  getImport(
    @Req() request: AuthenticatedRequest,
    @Param('id', ParseUUIDPipe) importId: string
  ): Promise<CvImportResponseDto> {
    return this.profiles.getImport(request.user.sub, importId);
  }

  @Post('cv-imports/:id/apply')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Apply a reviewed CV draft to the authenticated user profile' })
  @ApiOkResponse({ type: ProfileResponseDto })
  @ApiBadRequestResponse({ description: 'CV import is not ready to be applied' })
  @ApiNotFoundResponse({ description: 'CV import not found' })
  applyImport(
    @Req() request: AuthenticatedRequest,
    @Param('id', ParseUUIDPipe) importId: string,
    @Body() input: ApplyCvImportDto
  ): Promise<ProfileResponseDto> {
    return this.profiles.applyImport(request.user.sub, importId, input);
  }
}
