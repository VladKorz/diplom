import * as coreType from '../types/core';

import permission from '../models/db/permission';

const hasPermission = async (userId: number, perm: coreType.role): Promise<Boolean> => {
    return await permission.findOne({
        where: {
            userId: userId,
            body: perm
        }
    }) ? true : false
}

export default hasPermission;