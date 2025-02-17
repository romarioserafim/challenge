import { ContentType } from './content.enum'

export interface ContentMetadata {
  [ContentType.PDF]: { author: string; pages: number; encrypted: boolean }
  [ContentType.IMAGE]: { resolution: string; aspect_ratio: string }
  [ContentType.VIDEO]: { duration: number; resolution: string }
  [ContentType.LINK]: { trusted: boolean }
  [ContentType.TXT]: { encoding: string; line_count: number }
}
