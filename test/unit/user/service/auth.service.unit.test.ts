import { Test, TestingModule } from '@nestjs/testing'
import { suite, test } from '@testdeck/jest'
import { AuthService } from 'src/user/service'
import { UserRepository } from 'src/user/repository'
import { User } from 'src/user/entity'
import * as jwt from 'jsonwebtoken'

@suite
export class AuthServiceUnitTest {
  private authService: AuthService
  private userRepository: UserRepository

  private readonly mockUser: User = {
    id: '18c37ce2-cd34-4305-9ca4-c15fc736beac',
    name: 'John Doe',
    email: 'john.doe@example.com',
    password: 'hashed-password',
  } as User

  async before() {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: UserRepository,
          useValue: {
            findById: jest.fn(),
          },
        },
      ],
    }).compile()

    this.authService = module.get<AuthService>(AuthService)
    this.userRepository = module.get<UserRepository>(UserRepository)
  }

  @test
  async '[validateToken] Should return user for valid token'() {
    const validToken = jwt.sign({ user_id: this.mockUser.id }, process.env.JWT_SECRET || 'secret')

    jest.spyOn(jwt, 'verify').mockImplementation((token) => {
      if (token === validToken) {
        return { user_id: this.mockUser.id }
      } else {
        throw new Error('Invalid token')
      }
    })

    jest.spyOn(this.userRepository, 'findById').mockResolvedValue(this.mockUser)

    const result = await this.authService.validateToken(validToken)

    expect(jwt.verify).toHaveBeenCalledWith(validToken, process.env.JWT_SECRET)
    expect(this.userRepository.findById).toHaveBeenCalledWith(this.mockUser.id)
    expect(result).toStrictEqual(this.mockUser)
  }

  @test
  async '[validateToken] Should throw error if token is invalid'() {
    jest.spyOn(jwt, 'verify').mockImplementation(() => {
      throw new Error('Invalid token')
    })

    await expect(this.authService.validateToken('invalid.token')).rejects.toThrow('Invalid token')
  }
}
