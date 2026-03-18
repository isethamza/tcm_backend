import { Request, Response, NextFunction } from 'express';
import { JwtService } from '@nestjs/jwt';

if (!process.env.JWT_SECRET) {
  throw new Error('JWT_SECRET not set');
}

const jwtService = new JwtService({
  secret: process.env.JWT_SECRET,
});

export function bullBoardAuthMiddleware(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
								
				   
								
    const token =
      req.cookies?.accessToken ||
      req.headers.authorization?.split(' ')[1];

    if (!token) {
      return res.status(401).send('Unauthorized');
    }

								
					  
								
    const user = jwtService.verify(token);

								
					
								
    if (user.role !== 'ADMIN') {
      return res.status(403).send('Forbidden');
    }

							
    req['user'] = user;

    next();
  } catch {
    return res.status(401).send('Invalid token');
  }
}