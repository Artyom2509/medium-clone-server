import { Injectable, NestMiddleware } from '@nestjs/common';
import { Response, NextFunction } from 'express';
import { verify } from 'jsonwebtoken';
import { JWT_SECRET } from 'src/config';
import { ExpressRequestInterface } from 'src/types/expressRequest.interface';
import { UserEntity } from '../user.entity';
import { UserService } from '../user.service';

@Injectable()
export class AuthMiddleware implements NestMiddleware {
  constructor(private readonly userService: UserService) {}

  async use(req: ExpressRequestInterface, res: Response, next: NextFunction) {
    if (!req.headers.authorization) {
      req.user = null;
      return next();
    }

    try {
      const token = req.headers.authorization.split(' ')[1];
      const decode = verify(token, JWT_SECRET) as UserEntity;
      const user = await this.userService.findById(decode.id);
      req.user = user;
      next();
    } catch (err) {
      req.user = null;
      next();
    }
  }
}
