import { isBare } from '../compiler/import-map';
import type { Types } from '../models';
import { removeCDNPrefix, removeSpecifier } from './utils';

export const typesService = {
  getTypesAsImports: (types: string[]) =>
    types
      .map((type, i) => {
        const mod = removeSpecifier(removeCDNPrefix(type));
        if (!isBare(mod)) return '';
        return `import * as x${i} from '${type}';`;
      })
      .join('\n'),
};
