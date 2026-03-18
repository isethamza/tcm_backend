"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UpdateHubDto = void 0;
const swagger_1 = require("@nestjs/swagger");
const create_hub_dto_1 = require("./create-hub.dto");
class UpdateHubDto extends (0, swagger_1.PartialType)(create_hub_dto_1.CreateHubDto) {
}
exports.UpdateHubDto = UpdateHubDto;
//# sourceMappingURL=update-hub.dto.js.map