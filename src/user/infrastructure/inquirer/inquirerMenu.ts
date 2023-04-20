import inquirer from "inquirer";

const menu = [
	{
		type: "list",
		name: "option",
		message: "Choose one option",
		choices: [
			{
				value: "1",
				name: "1. Create Task",
			},
			{
				value: "2",
				name: "2. List Task",
			},
			{
				value: "3",
				name: "3. Update Task",
			},
			{
				value: "4",
				name: "4. Search Task",
			},
			{
				value: "5",
				name: "5. Delete Task",
			},
			{
				value: "0",
				name: "0. Create Task",
			},
		],
	},
];

const inquirerMenu = async (): Promise<string> => {
	/* console.clear();
	console.log("==========================");
	console.log("  Seleccione una opción");
	console.log("==========================\n"); */
	console.log(`
    ┌───── •✧✧• ───────┐
    - CHOOSE AN OPTION - 
    └───── •✧✧• ───────┘`);
	const { option } = await inquirer.prompt<{ option: string }>(menu);

	return option;
};

const readImput = async (message: string) => {
	const question = [
		{
			type: "input",
			name: "description",
			message,
			validate(value: string) {
				if (value.length === 0) {
					return "Please, add  a value";
				}

				return true;
			},
		},
	];
	const { description } = await inquirer.prompt(question);

	return description;
};

export { inquirerMenu };
