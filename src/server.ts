import 'reflect-metadata';
import hello from './handlers/hello';
import test from './handlers/test';

export { hello, test };
export * from './handlers/auth';
export * from './handlers/authorizers';
export * from './handlers/book';
export * from './handlers/file';
export * from './handlers/profile';
export * from './handlers/review';
