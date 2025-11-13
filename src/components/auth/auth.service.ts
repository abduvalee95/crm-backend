import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt'
import * as bcrypt from 'bcrypt';
import { User } from 'src/libs/entities/user'
import { T } from 'src/libs/types/common'


@Injectable()
export class AuthService {
	constructor(private jwtService: JwtService) {}

	public async hashPassword(memberPassword: string): Promise<string> {
		const salt = await bcrypt.genSalt();
		return await bcrypt.hash(memberPassword, salt);
	}

	public async comparePassword(password: string, hashedPassword: string): Promise<boolean> {
		return await bcrypt.compare(password, hashedPassword);
	}

	public async createToken(input: User): Promise<string> {
		const payload: T = {};
		Object.keys(input['_doc'] ? input['_doc'] : input).map((ele) => {
			payload[`${ele}`] = input[`${ele}`];
		});
		delete payload.password;

		return await this.jwtService.signAsync(payload);
	}

	public async verifyToken(token: string): Promise<User> {
		const input = await this.jwtService.verifyAsync(token); // Tokenga yuklagan qiymatmiz member osha memberni qiymatni olib berdi, vaqtniham verify qilyabmiz
		return input;
	}
}
