"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.bullBoardAuthMiddleware = bullBoardAuthMiddleware;
const jwt_1 = require("@nestjs/jwt");
if (!process.env.JWT_SECRET) {
    throw new Error('JWT_SECRET not set');
}
const jwtService = new jwt_1.JwtService({
    secret: process.env.JWT_SECRET,
});
function bullBoardAuthMiddleware(req, res, next) {
    try {
        const token = req.cookies?.accessToken ||
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
    }
    catch {
        return res.status(401).send('Invalid token');
    }
}
//# sourceMappingURL=queue-auth.middleware.js.map