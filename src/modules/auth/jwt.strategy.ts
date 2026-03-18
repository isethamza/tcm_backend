import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import type { Request } from 'express';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor() {
    super({
      jwtFromRequest: ExtractJwt.fromExtractors([
        // ✅ 1) HTTP-only cookie (PRIMARY for WebOps)
        (req: Request) => {
		
		 if (req?.cookies?.accessToken) {
		return req?.cookies?.accessToken;
			}
		return null;
          
        },

        // ✅ 2) Authorization header (fallback for API / mobile)
        ExtractJwt.fromAuthHeaderAsBearerToken(),
      ]),
      secretOrKey: process.env.JWT_SECRET,
    });
  }

  async validate(payload: any) {  
    // payload comes from JWT
    return {
      id: payload.sub,
      role: payload.role,
      email: payload.email,
      status: payload.status,
    };
 }
 
}