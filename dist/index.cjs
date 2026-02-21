Object.defineProperty(exports, Symbol.toStringTag, { value: 'Module' });

//#region src/verbs.ts
const defaultImperativeVerbs = [
	"add",
	"adjust",
	"bump",
	"change",
	"clean",
	"create",
	"disable",
	"document",
	"drop",
	"enable",
	"fix",
	"implement",
	"improve",
	"introduce",
	"migrate",
	"refactor",
	"remove",
	"rename",
	"replace",
	"revert",
	"simplify",
	"update",
	"upgrade"
];

//#endregion
//#region src/parsing.ts
function escapeRegExp(value) {
	return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}
function getAllowedVerbs(input) {
	if (!input || input.length === 0) return new Set(defaultImperativeVerbs);
	const verbs = input.map((verb) => verb.trim().toLowerCase()).filter((verb) => verb.length > 0);
	if (verbs.length === 0) throw new Error("imperativeVerbs must contain at least one non-empty verb when provided.");
	return new Set(verbs);
}
function parseBooleanInput(name, value) {
	const normalized = value.trim().toLowerCase();
	if (normalized === "true") return true;
	if (normalized === "false") return false;
	throw new Error(`${name} must be either 'true' or 'false'.`);
}
function parseImperativeVerbsInput(input) {
	return input.split(",").map((verb) => verb.trim()).filter((verb) => verb.length > 0);
}

//#endregion
//#region src/validator.ts
function createPullRequestTitleValidator(options = {}) {
	const issuePrefix = options.issuePrefix ?? "";
	const enforceLowercase = options.enforceLowercase ?? true;
	const allowedVerbs = getAllowedVerbs(options.imperativeVerbs);
	return ({ title }) => {
		if (title === "") throw new Error("Unable to validate PR title. title is empty.");
		const titleMatch = /^[^:]+:\s+(.+)$/.exec(title);
		if (!titleMatch) throw new Error("PR title must include a subject after ': '.");
		const subject = titleMatch[1];
		let subjectCore = subject;
		if (issuePrefix !== "") {
			const escapedPrefix = escapeRegExp(issuePrefix);
			const validTicketRegex = new RegExp(`^(.*)\\s(${escapedPrefix}[1-9][0-9]*)$`);
			const prefixedSuffixRegex = new RegExp(`\\s${escapedPrefix}[0-9]+$`);
			const validMatch = validTicketRegex.exec(subject);
			if (validMatch) subjectCore = validMatch[1];
			else if (prefixedSuffixRegex.test(subject)) throw new Error(`Issue suffix is invalid. Expected '${issuePrefix}<positive-integer>' (for example ${issuePrefix}123).`);
		}
		if (subjectCore.length === 0) throw new Error("PR subject cannot be empty.");
		if (enforceLowercase && /[A-Z]/.test(subjectCore)) throw new Error("PR subject must be all lowercase.");
		const firstWord = (subjectCore.split(" ")[0] ?? "").toLowerCase();
		if (!allowedVerbs.has(firstWord)) throw new Error("PR subject must start with an allowed imperative verb (for example: add, update, fix, remove, refactor).");
	};
}

//#endregion
//#region src/runtime.ts
function runFromEnv() {
	const title = process.env.PR_TITLE ?? "";
	const issuePrefix = process.env.ISSUE_PREFIX ?? "";
	const enforceLowercaseInput = process.env.ENFORCE_LOWERCASE ?? "true";
	const imperativeVerbsInput = process.env.IMPERATIVE_VERBS ?? "";
	createPullRequestTitleValidator({
		issuePrefix,
		enforceLowercase: parseBooleanInput("enforce-lowercase", enforceLowercaseInput),
		imperativeVerbs: parseImperativeVerbsInput(imperativeVerbsInput)
	})({ title });
}

//#endregion
//#region src/index.ts
if (require.main === module) try {
	runFromEnv();
} catch (error) {
	const message = error instanceof Error ? error.message : String(error);
	console.error(`::error::${message}`);
	process.exit(1);
}

//#endregion
exports.createPullRequestTitleValidator = createPullRequestTitleValidator;