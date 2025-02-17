import { Injectable } from '@nestjs/common'
import { Content } from 'src/content/entity'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'

@Injectable()
export class ContentRepository {
  constructor(@InjectRepository(Content) private readonly contentRepository: Repository<Content>) {}

  async findOne(contentId: string): Promise<Content | null> {
    return this.contentRepository.findOne({
      where: {
        id: contentId,
      },
    })
  }
}
