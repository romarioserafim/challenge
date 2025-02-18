import * as fs from 'fs'
import {
  BadRequestException,
  Injectable,
  Logger,
  NotFoundException,
  UnprocessableEntityException,
} from '@nestjs/common'
import { ContentRepository } from 'src/content/repository'
import { ProvisionDto } from 'src/content/dto'
import { ContentFactory } from 'src/content/factory'
import { ContentType } from 'src/content/enum'

@Injectable()
export class ContentService {
  private readonly logger = new Logger(ContentService.name)

  constructor(private readonly contentRepository: ContentRepository) {}

  async provision(contentId: string): Promise<ProvisionDto> {
    if (!contentId) {
      this.logger.error(`Invalid Content ID: ${contentId}`)
      throw new UnprocessableEntityException(`Content ID is invalid: ${contentId}`)
    }

    this.logger.log(`Provisioning content for id=${contentId}`)

    const content = await this.contentRepository.findOne(contentId)
    if (!content) {
      this.logger.warn(`Content not found for id=${contentId}`)
      throw new NotFoundException(`Content not found: ${contentId}`)
    }

    if (!Object.values(ContentType).includes(content.type as ContentType)) {
      this.logger.warn(`Unsupported content type for ID=${contentId}, type=${content.type}`)
      throw new BadRequestException(`Unsupported content type: ${content.type}`)
    }

    const bytes = this.getFileSize(content.url)

    return ContentFactory.buildProvisionDto(content, bytes)
  }

  private getFileSize(filePath?: string): number {
    if (!filePath || !fs.existsSync(filePath)) return 0
    try {
      return fs.statSync(filePath).size
    } catch (error) {
      this.logger.error(`File system error: ${error}`)
      return 0
    }
  }
}
