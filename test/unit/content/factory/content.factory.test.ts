import { suite, test } from '@testdeck/jest'
import { ContentFactory } from 'src/content/factory/content.factory'
import { ContentType } from 'src/content/enum'
import { ProvisionDto } from 'src/content/dto'

@suite
export class ContentFactoryUnitTest {
  private readonly mockCompany = {
    id: '456',
    name: 'Test Company',
    users: [],
    contents: [],
  }

  private readonly mockContent = {
    id: '123',
    title: 'Test Content',
    cover: 'cover.jpg',
    created_at: new Date(),
    updated_at: new Date(),
    deleted_at: null,
    description: 'A test content description',
    total_likes: 10,
    type: ContentType.PDF,
    url: 'http://localhost:3000/uploads/test.pdf',
    company: this.mockCompany,
  }

  @test
  async '[buildProvisionDto] Should build a ProvisionDto correctly'() {
    const bytes = 1024
    const provisionDto: ProvisionDto = ContentFactory.buildProvisionDto(this.mockContent, bytes)

    expect(provisionDto).toMatchObject({
      id: this.mockContent.id,
      title: this.mockContent.title,
      cover: this.mockContent.cover,
      created_at: this.mockContent.created_at,
      description: this.mockContent.description,
      total_likes: this.mockContent.total_likes,
      type: this.mockContent.type,
      url: expect.stringContaining(this.mockContent.url),
      allow_download: true,
      is_embeddable: false,
      format: 'pdf',
      bytes,
    })

    expect(provisionDto.metadata).toBeDefined()
  }

  @test
  async '[getFormat] Should return correct format for different content types'() {
    expect(ContentFactory['getFormat'](ContentType.LINK, 'http://example.com')).toBeNull()
    expect(ContentFactory['getFormat'](ContentType.PDF, 'file.pdf')).toBe('pdf')
    expect(ContentFactory['getFormat'](ContentType.VIDEO, 'video.mp4')).toBe('mp4')
    expect(ContentFactory['getFormat'](ContentType.PDF)).toBeNull()
  }

  @test
  async '[generateSignature] Should generate a signed URL'() {
    const signedUrl = ContentFactory['generateSignature'](this.mockContent.url)

    expect(signedUrl).toContain(this.mockContent.url)
    expect(signedUrl).toMatch(/expires=\d+/)
    expect(signedUrl).toMatch(/signature=[a-z0-9]+/)
  }
}
