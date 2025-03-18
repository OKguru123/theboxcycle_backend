import { Injectable, CanActivate, ExecutionContext, HttpException, HttpStatus } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { JwtService } from '@nestjs/jwt';
import { Observable } from 'rxjs';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private jwtService: JwtService, private reflector: Reflector) {}

  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {
    const request = context.switchToHttp().getRequest();
    const token = request.headers.authorization?.split(' ')[1]; // Bearer Token from header
    
    if (!token) {
      throw new HttpException('Authorization token not found', HttpStatus.FORBIDDEN);
    }

    try {
      const decoded = this.jwtService.verify(token, {
        secret: process.env.JWT_SECRET // Make sure your environment variable is securely managed
      });
      request.user = decoded;
      
      const roles = this.reflector.get<number[]>('roles', context.getHandler());
      if (!roles) {
        return true; // If no roles are required by the route, allow access
      }
      if (!this.matchRoles(decoded.role, roles)) {
        throw new HttpException('Insufficient permissions', HttpStatus.FORBIDDEN);
      }
      return true;
    } catch (error) {
      if (error.name === 'TokenExpiredError') {
        throw new HttpException('Token has expired', HttpStatus.UNAUTHORIZED);
      } else if (error.name === 'JsonWebTokenError') {
        throw new HttpException('Invalid token', HttpStatus.UNAUTHORIZED);
      }
      throw new HttpException('Unauthorized access', HttpStatus.UNAUTHORIZED);
    }
  }

  private matchRoles(userRole: number, allowedRoles: number[]): boolean {
    return allowedRoles.includes(userRole);
  }
}
