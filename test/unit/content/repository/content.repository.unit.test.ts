import { Test, TestingModule } from '@nestjs/testing'
import { suite, test } from '@testdeck/jest'
import { ContentRepository } from 'src/content/repository'
import { getRepositoryToken } from '@nestjs/typeorm'
import { Content } from 'src/content/entity'
import { Repository } from 'typeorm'

@suite
export class ContentRepositoryUnitTest {
  private contentRepository: ContentRepository
  private repository: Repository<Content>

  private readonly mockContent: Content = {
    id: '4372ebd1-2ee8-4501-9ed5-549df46d0eb0',
    title: 'Sample Content',
    description: 'Test Description',
    url: 'http://localhost:3000/uploads/dummy.pdf',
    created_at: new Date('2025-01-31T23:39:54.236Z'),
    total_likes: 10,
    type: 'pdf',
  } as Content

  async before() {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ContentRepository,
        {
          provide: getRepositoryToken(Content),
          useValue: {
            findOne: jest.fn(),
          },
        },
      ],
    }).compile()

    this.contentRepository = module.get<ContentRepository>(ContentRepository)
    this.repository = module.get<Repository<Content>>(getRepositoryToken(Content))
  }

  @test
  async '[findOne] Should return content when found'() {
    jest.spyOn(this.repository, 'findOne').mockResolvedValue(this.mockContent)

    const result = await this.contentRepository.findOne(this.mockContent.id)

    expect(this.repository.findOne).toHaveBeenCalledWith({
      where: {
        id: this.mockContent.id,
      },
    })

    expect(result).toStrictEqual(this.mockContent)
  }
  @test
  async '[findOne] Should return null if content is not found'() {
    jest.spyOn(this.repository, 'findOne').mockResolvedValue(null)

    const result = await this.contentRepository.findOne('non-existent-id')

    expect(this.repository.findOne).toHaveBeenCalledWith({
      where: {
        id: 'non-existent-id',
      },
    })

    expect(result).toBeNull()
  }

  @test
  async '[findOne] Should throw error if database query fails'() {
    jest.spyOn(this.repository, 'findOne').mockRejectedValue(new Error('Database error'))

    await expect(this.contentRepository.findOne(this.mockContent.id)).rejects.toThrow(
      'Database error',
    )
  }
}
