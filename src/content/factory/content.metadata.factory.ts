import { BadRequestException, Injectable } from '@nestjs/common'
import { Content } from 'src/content/entity'
import { ContentType } from 'src/content/enum'

@Injectable()
export class ContentMetadataFactory {
  static create(content: Content, bytes: number) {
    switch (content.type) {
      case ContentType.PDF:
        return {
          author: 'Unknown',
          pages: Math.max(1, Math.floor(bytes / 50000)),
          encrypted: false,
        }
      case ContentType.IMAGE:
        return { resolution: '1920x1080', aspect_ratio: '16:9' }
      case ContentType.VIDEO:
        return { duration: Math.max(10, Math.floor(bytes / 100000)), resolution: '1080p' }
      case ContentType.LINK:
        return { trusted: content.url?.startsWith('https') || false }
      case ContentType.TXT:
        return { encoding: 'UTF-8', line_count: Math.max(1, Math.floor(bytes / 100)) }
      default:
        throw new BadRequestException('Invalid content type')
    }
  }
}
