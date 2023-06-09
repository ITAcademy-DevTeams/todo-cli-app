/* eslint-disable no-console */
/* eslint-disable no-await-in-loop */
import { logBuffer } from "../backend/shared/infrastructure/config/sequelize";
import { TaskController } from "../backend/task/infrastructure/TaskController";
import { UserController } from "../backend/user/infrastructure/UserController";
import { inquirerMenu, showDbList, userMenu } from "./inquirerMenu";
import { showStatusList, showTasks } from "./inquirerTask";
import { confirmOperation, getPassword, getSignUpPassword, pause, readInput } from "./inquireUtils";

class Inquirer {
	private userId = "";
	constructor(
		private readonly userController: UserController,
		private readonly taskController: TaskController
	) {}

	async start(): Promise<void> {
		do {
			let isAuthenticated = await this.authenticateUser();
			if (!isAuthenticated) {
				console.log("Exiting...");

				return;
			}
			let opt = "";
			do {
				console.clear();
				opt = await inquirerMenu();
				try {
					switch (opt) {
						case "1":
							await this.createTask();
							break;
						case "2":
							await this.listUserTasks();
							break;
						case "3":
							await this.updateTask();
							break;
						case "4":
							await this.searchTask();
							break;
						case "5":
							await this.deleteTask();
							break;
						case "0":
							isAuthenticated = false;
							break;
					}
				} catch (error: unknown) {
					if (error instanceof Error) {
						console.log(error.message);
					} else {
						console.log("An error occurred");
					}
				}
				this.displaySequelizeLogs();
				await pause();
			} while (isAuthenticated);
			// eslint-disable-next-line @typescript-eslint/no-unnecessary-condition, no-constant-condition
		} while (true);
	}

	private async authenticateUser(): Promise<boolean> {
		await this.selectDb();

		let isAuthenticated = false;

		let opt = "";
		do {
			console.clear();
			opt = await userMenu();
			switch (opt) {
				case "login": {
					const userName = await readInput("userName: ");
					const password = await getPassword();
					this.userId = await this.userController.authenticate(userName, password);
					if (this.userId.length === 0) {
						console.log("Invalid username or password.");
					} else {
						isAuthenticated = true;
					}
					break;
				}
				case "signup": {
					const userNameSignUp = await readInput("userName: ");
					const passwordSignUp = await getSignUpPassword();
					await this.userController.createUser(userNameSignUp, passwordSignUp);
					console.log("User created successfully!");
					this.userId = await this.userController.authenticate(userNameSignUp, passwordSignUp);
					isAuthenticated = true;
					break;
				}
			}
			this.displaySequelizeLogs();
			await pause();
		} while (this.userId.length === 0 && opt !== "exit");

		return isAuthenticated;
	}

	private async createTask() {
		const desc = await readInput("description");
		await this.taskController.createTask(desc, this.userId);
	}

	private async listUserTasks() {
		const taskList = await this.taskController.listUserTasks(this.userId);
		if (taskList.length !== 0) {
			taskList.forEach((task, i) => {
				const idx = `${i + 1}.`;
				console.log(`${idx} ${task.description} :: ${task.status}`);
			});
		} else {
			console.log("\n There are no task");
		}
	}

	private async updateTask(): Promise<void> {
		const partialTask: { description?: string; status?: string } = {};
		const taskList = await this.taskController.listUserTasks(this.userId);
		if (taskList.length !== 0) {
			const idx = await showTasks(taskList);
			const confirmDesc = await confirmOperation("Do you want to update description?");
			if (confirmDesc) {
				partialTask.description = await readInput("Add a new description:");
			}
			const confirmStatus = await confirmOperation("Do you want to update status?");

			if (confirmStatus) {
				partialTask.status = await showStatusList();
			}
			!confirmDesc && !confirmStatus
				? console.log("\n No changes have been made")
				: console.log("\n Task updated successfully");

			await this.taskController.updateTask(idx, partialTask);
		} else {
			console.log("\n There are no task");
		}
	}

	private async searchTask() {
		const taskList = await this.taskController.listUserTasks(this.userId);
		if (taskList.length !== 0) {
			const idx = await showTasks(taskList);
			const task = await this.taskController.searchTask(idx);
			console.log(`
	Description: ${task.description},
	Status: ${task.status},
	Started at: ${task.startTime},
	Ended at: ${task.status !== "Completed" ? "Task still on going" : task.endTime}
	`);
		} else {
			console.log("\n There are no task");
		}
	}

	private async deleteTask() {
		const taskList = await this.taskController.listUserTasks(this.userId);
		if (taskList.length !== 0) {
			const idx = await showTasks(taskList);
			await this.taskController.deleteTask(idx);
			console.log("\n Task deleted successfully");
		} else {
			console.log("\n There are no task");
		}
	}

	private async selectDb(): Promise<void> {
		let db = "";
		console.clear();
		db = await showDbList();
		this.userController.chooseRepository(db);
		this.taskController.chooseRepository(db);
		this.displaySequelizeLogs();
		await pause();
	}

	private displaySequelizeLogs() {
		logBuffer.forEach((log) => {
			console.log(log);
		});
		logBuffer.length = 0; // Limpia el buffer después de mostrar los registros
	}
}
export default Inquirer;
