import { readJsonFile, writeJsonFile } from "../../../shared/infrastructure/JsonFileUtil";
import User from "../../domain/User";
import UserRepository from "../../domain/UserRepository";

class JsonUserRepository implements UserRepository {
	constructor(public path: string) {}

	async update(id: string, updatedUserData: Partial<User>): Promise<boolean> {
		const data = await readJsonFile<User>(this.path);
		const userToUpdate = data.findIndex((user) => user.uuid === id);
		if (userToUpdate === -1) {
			throw new Error("Not found");
		}
		data[userToUpdate] = { ...data[userToUpdate], ...updatedUserData };

		await writeJsonFile<User>(this.path, data);

		return true;
	}

	async delete(id: string): Promise<boolean> {
		const data = await readJsonFile<User>(this.path);
		const user = data.findIndex((user) => user.uuid === id);
		if (user !== -1) {
			data.splice(user, 1);
			await writeJsonFile<User>(this.path, data);

			return true;
		}

		throw new Error("User not found");
	}

	async get(id: string): Promise<User> {
		const data = await readJsonFile<User>(this.path);
		const user = data.find((user) => user.uuid === id);

		if (user === undefined) {
			throw new Error("User Not Found");
		}

		return user;
	}

	async create(user: User): Promise<User> {
		const data = await readJsonFile<User>(this.path);

		data.push(user);
		await writeJsonFile(this.path, data);

		return user;
	}

	async getUserByUsername(username: string): Promise<User> {
		const data = await readJsonFile<User>(this.path);
		const user = data.find((user) => user.userName === username);

		if (user === undefined) {
			throw new Error("User Not Found");
		}

		return user;
	}
}

export default JsonUserRepository;
