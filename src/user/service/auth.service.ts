import * as jwt from 'jsonwebtoken'
import { Injectable, Logger } from '@nestjs/common'
import { User } from 'src/user/entity'
import { UserRepository } from 'src/user/repository'

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name)

  constructor(private readonly userRepository: UserRepository) {}

  async validateToken(token: string): Promise<User> {
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET) as { user_id: string }
      return await this.userRepository.findById(decoded.user_id)
    } catch (error) {
      this.logger.error(`Error validating token: ${error}`)

      throw new Error('Invalid token')
    }
  }
}
