/* eslint-disable no-console */
import dotenv from "dotenv";

import connectMongoDB from "../../shared/infrastructure/config/connectMongoDB";
import { sequelize } from "../../shared/infrastructure/config/sequelize";
import { IUserSwitchRepository } from "../domain/IUserSwitchRepository";
import User from "../domain/User";
import UserRepository from "../domain/UserRepository";
import JsonUserRepository from "./json/JsonUserRepository";
import { MongoUserRepository } from "./mongo/MongoUserRepository";
import { UserMysqlRepository } from "./mysql/UserMysqlRepository";

dotenv.config();

export class UserSwitchRepository implements IUserSwitchRepository {
	private userRepository: UserRepository;
	constructor(
		public readonly jsonUserRepository: JsonUserRepository,
		private readonly mongoUserRepository: MongoUserRepository,
		private readonly sequelizeUserRepository: UserMysqlRepository
	) {
		this.userRepository = jsonUserRepository;
	}

	async create(user: User): Promise<User> {
		return this.userRepository.create(user);
	}

	async update(id: string, updatedUserData: Partial<User>): Promise<boolean> {
		return this.userRepository.update(id, updatedUserData);
	}

	async delete(id: string): Promise<boolean> {
		return this.userRepository.delete(id);
	}

	async get(id: string): Promise<User> {
		return this.userRepository.get(id);
	}

	async getUserByUsername(username: string): Promise<User> {
		return this.userRepository.getUserByUsername(username);
	}

	public getUserRepository(): UserRepository {
		return this.userRepository;
	}

	public async switchRepository(db?: string): Promise<void> {
		switch (db) {
			case "JSON":
				this.userRepository = this.jsonUserRepository;
				break;

			case "MongoDB":
				try {
					this.userRepository = this.mongoUserRepository;
					await connectMongoDB();

					break;
				} catch (error) {
					console.log(
						"Error: there was a problem connecting to MongoDB. You will be redirected to JSON."
					);

					this.userRepository = this.jsonUserRepository;
					break;
				}
			case "MySQL":
				try {
					await sequelize.authenticate();
					await sequelize.sync();
					this.userRepository = this.sequelizeUserRepository;

					break;
				} catch (error) {
					console.log(
						"Error: there was a problem connecting to MySQL. You will be redirected to JSON."
					);

					this.userRepository = this.jsonUserRepository;
					break;
				}

			default:
				this.userRepository = this.jsonUserRepository;
				break;
		}
	}
}
