import { join } from 'node:path';
import { writeFileSync } from 'node:fs';


console.log('* create-package-json');

const buildPath: string = join('.', 'build');

writeFileSync(join(buildPath, 'cjs', 'package.json'), JSON.stringify({
	type: 'commonjs'
}));

writeFileSync(join(buildPath, 'esm', 'package.json'), JSON.stringify({
	type: 'module'
}));
