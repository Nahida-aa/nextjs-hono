import { hash, compare } from 'bcrypt-ts';

export const hash_password = async (password: string): Promise<string> => await hash(password, 10);

export const compare_password = async (password: string, hash_password: string): Promise<boolean> => await compare(password, hash_password);
