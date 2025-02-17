import * as fs from 'fs'
import * as path from 'path'
import {
  BadRequestException,
  Injectable,
  Logger,
  NotFoundException,
  UnprocessableEntityException,
} from '@nestjs/common'
import { ContentRepository } from 'src/content/repository'
import { ProvisionDto } from 'src/content/dto'
import { ContentMetadata } from 'src/content/factory'
import { ContentType } from 'src/content/factory/content.enum'

interface ContentBase {
  id: string
  title: string
  cover: string
  created_at: Date
  description: string
  total_likes: number
  type: ContentType
}

@Injectable()
export class ContentService {
  private readonly logger = new Logger(ContentService.name)
  private readonly expirationTime = 3600

  constructor(private readonly contentRepository: ContentRepository) {}

  async provision(contentId: string): Promise<ProvisionDto> {
    if (!contentId) {
      this.logger.error(`Invalid Content ID: ${contentId}`)
      throw new UnprocessableEntityException(`Content ID is invalid: ${contentId}`)
    }

    this.logger.log(`Provisioning content for id=${contentId}`)
    let content

    try {
      content = await this.contentRepository.findOne(contentId)
    } catch (error) {
      this.logger.error(`Database error while fetching content: ${error}`)
      throw new NotFoundException(`Database error: ${error}`)
    }

    if (!content) {
      this.logger.warn(`Content not found for id=${contentId}`)
      throw new NotFoundException(`Content not found: ${contentId}`)
    }

    const filePath = content.url ? content.url : undefined
    let bytes = 0

    try {
      bytes = fs.existsSync(filePath) ? fs.statSync(filePath).size : 0
    } catch (error) {
      this.logger.error(`File system error: ${error}`)
    }

    const url = this.generateSignedUrl(content.url || '')
    if (!content.type || !Object.values(ContentType).includes(content.type as ContentType)) {
      this.logger.warn(`Unsupported content type for ID=${contentId}, type=${content.type}`)
      throw new BadRequestException(`Unsupported content type: ${content.type}`)
    }

    return this.getContentByType(content, bytes, url)
  }

  private generateSignedUrl(originalUrl: string): string {
    const expires = Math.floor(Date.now() / 1000) + this.expirationTime
    return `${originalUrl}?expires=${expires}&signature=${Math.random().toString(36).substring(7)}`
  }

  private getContentByType(content: ContentBase, bytes: number, url: string): ProvisionDto {
    const metadata = this.getMetadata(content, bytes)

    return {
      id: content.id,
      title: content.title,
      cover: content.cover,
      created_at: content.created_at,
      description: content.description,
      total_likes: content.total_likes,
      type: content.type,
      url,
      allow_download: content.type !== ContentType.LINK && content.type != ContentType.VIDEO,
      is_embeddable: content.type !== ContentType.PDF,
      format: this.getFormat(content),
      bytes,
      metadata,
    }
  }

  private getMetadata(
    content: { type: ContentType; url?: string },
    bytes: number,
  ): ContentMetadata[ContentType] {
    switch (content.type) {
      case ContentType.PDF:
        return {
          author: 'Unknown',
          pages: Math.floor(bytes / 50000) || 1,
          encrypted: false,
        }
      case ContentType.IMAGE:
        return { resolution: '1920x1080', aspect_ratio: '16:9' }
      case ContentType.VIDEO:
        return { duration: Math.floor(bytes / 100000) || 10, resolution: '1080p' }
      case ContentType.LINK:
        return { trusted: content.url?.includes('https') || false }
      case ContentType.TXT:
        return { encoding: 'UTF-8', line_count: Math.floor(bytes / 100) || 1 }
      default:
        throw new BadRequestException('Invalid content type')
    }
  }

  private getFormat(content: { type: ContentType; url?: string }): string | null {
    if (content.url && content.type !== ContentType.LINK) {
      return path.extname(content.url).slice(1) || null
    }
    return null
  }
}
