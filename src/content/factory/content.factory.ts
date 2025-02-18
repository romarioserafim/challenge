import { Content } from 'src/content/entity'
import { ContentType } from 'src/content/enum'
import { ProvisionDto } from 'src/content/dto'
import * as path from 'path'
import { ContentMetadataFactory } from 'src/content/factory/content.metadata.factory'

export class ContentFactory {
  private static readonly expirationTime = 3600
  static buildProvisionDto(content: Content, bytes: number): ProvisionDto {
    const url = this.generateSignature(content.url || '')
    return {
      id: content.id,
      title: content.title,
      cover: content.cover,
      created_at: content.created_at,
      description: content.description,
      total_likes: content.total_likes,
      type: content.type,
      url,
      allow_download: ![ContentType.LINK, ContentType.VIDEO].includes(content.type as ContentType),
      is_embeddable: content.type !== ContentType.PDF,
      format: this.getFormat(content.type, content.url),
      bytes,
      metadata: ContentMetadataFactory.create(content, bytes),
    }
  }

  private static getFormat(type: string, filePath?: string): string | null {
    if (type === ContentType.LINK) return null
    return filePath ? path.extname(filePath).slice(1) || null : null
  }

  private static generateSignature(originalUrl: string): string {
    const expires = Math.floor(Date.now() / 1000) + this.expirationTime
    const signature = Math.random().toString(36).substring(7)
    return `${originalUrl}?expires=${expires}&signature=${signature}`
  }
}
