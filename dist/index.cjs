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
function normalizeVerbs(input) {
	if (!input) return [];
	return input.map((verb) => verb.trim().toLowerCase()).filter((verb) => verb.length > 0);
}
function getAllowedVerbs(options) {
	const verbs = normalizeVerbs(options.verbs);
	const addVerbs = normalizeVerbs(options.addVerbs);
	if (verbs.length > 0 && addVerbs.length > 0) throw new Error("verbs and add-verbs cannot both be set. Use verbs to override or add-verbs to extend defaults.");
	if (options.verbs && verbs.length === 0) throw new Error("verbs must contain at least one non-empty verb when provided.");
	if (verbs.length > 0) return new Set(verbs);
	if (addVerbs.length > 0) return new Set([...defaultImperativeVerbs, ...addVerbs]);
	return new Set(defaultImperativeVerbs);
}
function parseBooleanInput(name, value) {
	const normalized = value.trim().toLowerCase();
	if (normalized === "true") return true;
	if (normalized === "false") return false;
	throw new Error(`${name} must be either 'true' or 'false'.`);
}
function parseVerbsInput(input) {
	if (input.trim().length === 0) return;
	return input.split(",").map((verb) => verb.trim()).filter((verb) => verb.length > 0);
}

//#endregion
//#region src/validator.ts
function createPullRequestTitleValidator(options = {}) {
	const issuePrefix = options.issuePrefix ?? "";
	const strictIssueSuffix = options.strictIssueSuffix ?? true;
	const enforceLowercase = options.enforceLowercase ?? true;
	const allowedVerbs = getAllowedVerbs({
		verbs: options.verbs,
		addVerbs: options.addVerbs
	});
	const issueLikeSuffixPattern = "([a-z][a-z0-9_]*-[0-9]+|#[0-9]+)";
	const issueLikeSuffixRegex = /\s(?:[a-z][a-z0-9_]*-\d+|#\d+)$/i;
	const trailingIssueLikeSuffixRegex = new RegExp(`^(.*)\\s${issueLikeSuffixPattern}$`, "i");
	return ({ title }) => {
		if (title === "") throw new Error("Unable to validate PR title. title is empty.");
		if (/^[^:]+:\s*$/.test(title)) throw new Error("PR subject cannot be empty.");
		if (title !== title.trim()) throw new Error("PR title cannot have leading or trailing whitespace.");
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
			else if (strictIssueSuffix && issueLikeSuffixRegex.test(subject)) throw new Error(`Issue suffix is invalid. Expected '${issuePrefix}<positive-integer>' (for example ${issuePrefix}123).`);
		} else if (strictIssueSuffix && issueLikeSuffixRegex.test(subject)) throw new Error("Issue suffix is not allowed unless issue-prefix is configured. Set strict-issue-suffix to false to allow it.");
		if (!strictIssueSuffix) {
			const trailingIssueMatch = trailingIssueLikeSuffixRegex.exec(subjectCore);
			if (trailingIssueMatch) subjectCore = trailingIssueMatch[1];
		}
		if (subjectCore.length === 0) throw new Error("PR subject cannot be empty.");
		if (enforceLowercase && /[A-Z]/.test(subjectCore)) throw new Error("PR subject must be all lowercase.");
		const firstWord = (subjectCore.split(" ")[0] ?? "").toLowerCase();
		if (!allowedVerbs.has(firstWord)) throw new Error(["PR subject must start with an allowed imperative verb,", `for example: ${Array.from(allowedVerbs).map((verb) => `'${verb}'`).join(", ")}.`].join(" "));
	};
}

//#endregion
//#region src/runtime.ts
function runFromEnv() {
	const title = process.env.PR_TITLE ?? "";
	const issuePrefix = process.env.ISSUE_PREFIX ?? "";
	const strictIssueSuffixInput = process.env.STRICT_ISSUE_SUFFIX ?? "true";
	const enforceLowercaseInput = process.env.ENFORCE_LOWERCASE ?? "true";
	const verbsInput = process.env.VERBS ?? "";
	const addVerbsInput = process.env.ADD_VERBS ?? "";
	createPullRequestTitleValidator({
		issuePrefix,
		strictIssueSuffix: parseBooleanInput("strict-issue-suffix", strictIssueSuffixInput),
		enforceLowercase: parseBooleanInput("enforce-lowercase", enforceLowercaseInput),
		verbs: parseVerbsInput(verbsInput),
		addVerbs: parseVerbsInput(addVerbsInput)
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