import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { AuthGuard } from '@nestjs/passport';
import { ExecutionContext } from '@nestjs/common';
import { Observable } from 'rxjs';
import { Reflector } from '@nestjs/core';
import { UserRole } from '@prisma/client';
import { UnauthorizedException } from '@nestjs/common';

/**
 * JwtAuthGuard is used to protect routes by verifying JWT.
 * It extends Passport's AuthGuard and adds the JWT strategy to it.
 * It will also check for roles if needed.
 */
@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  constructor(private readonly reflector: Reflector) {
    super();
  }

  // Called when a request comes in to the route.
  // Checks if the user is authenticated.
  canActivate(context: ExecutionContext): boolean | Promise<boolean> | Observable<boolean> {
    const roles = this.reflector.get<UserRole[]>('roles', context.getHandler());
    
    const request = context.switchToHttp().getRequest();
    const user = request.user; // Comes from JWT Strategy

    // If there are no roles specified for the route, it will be accessible by anyone
    if (!roles || roles.length === 0) {
      return super.canActivate(context);
    }

    // If roles are specified, check if the user role matches any of them
    if (!roles.includes(user.role)) {
      throw new UnauthorizedException('Forbidden');
    }

    return super.canActivate(context);
  }
}